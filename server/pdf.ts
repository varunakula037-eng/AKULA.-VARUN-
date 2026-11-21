import PDFDocument from 'pdfkit';
import type { Response } from 'express';
import type { InterviewSession } from '../src/types.ts';

export function streamInterviewPdfReport(session: InterviewSession, res: Response): void {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 48,
    info: {
      Title: `INTERVIEWX AI Report - ${session.job_role}`,
      Author: 'INTERVIEWX AI',
      Subject: 'Mock Interview Performance Report',
    },
  });

  const safeRole = session.job_role.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="interviewx-report-${safeRole}-${session.id.slice(0, 8)}.pdf"`
  );

  doc.pipe(res);

  const navy = '#0B1120';
  const slate = '#334155';
  const muted = '#64748B';
  const violet = '#6D28D9';
  const blue = '#2563EB';
  const emerald = '#059669';
  const amber = '#D97706';

  // Header Banner
  doc.rect(0, 0, doc.page.width, 108).fill(navy);
  doc
    .fillColor('#FFFFFF')
    .font('Helvetica-Bold')
    .fontSize(22)
    .text('INTERVIEWX AI', 48, 32);
  doc
    .fillColor('#A5B4FC')
    .font('Helvetica')
    .fontSize(10)
    .text('Practice Smart. Speak Confidently. Get Hired.', 48, 58);

  const reportDate = new Date(session.completed_at || session.created_at).toLocaleDateString(
    'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );
  doc
    .fillColor('#CBD5E1')
    .fontSize(10)
    .text(`Performance Report  |  ${reportDate}`, 48, 76);

  if (session.overall_score !== null) {
    doc
      .fillColor('#38BDF8')
      .font('Helvetica-Bold')
      .fontSize(26)
      .text(`${Math.round(session.overall_score)}/100`, 420, 36, {
        width: 127,
        align: 'right',
      });
    doc
      .fillColor('#CBD5E1')
      .font('Helvetica')
      .fontSize(9)
      .text('Overall Score', 420, 68, { width: 127, align: 'right' });
  }

  doc.y = 128;

  // Session Metadata
  doc
    .fillColor(navy)
    .font('Helvetica-Bold')
    .fontSize(14)
    .text('Interview Profile', 48, doc.y);
  doc.moveDown(0.4);

  const metaLines = [
    `Target Role: ${session.job_role}`,
    `Experience Level: ${session.experience_level}  |  Difficulty: ${session.difficulty}  |  Type: ${session.interview_type}`,
    `Questions: ${session.question_count}  |  Average Score: ${session.average_score !== null ? `${session.average_score.toFixed(1)} / 10` : 'N/A'}`,
  ];
  if (session.technical_avg !== null || session.hr_avg !== null) {
    const parts: string[] = [];
    if (session.technical_avg !== null) parts.push(`Technical Avg: ${session.technical_avg.toFixed(1)} / 10`);
    if (session.hr_avg !== null) parts.push(`HR Avg: ${session.hr_avg.toFixed(1)} / 10`);
    metaLines.push(parts.join('  |  '));
  }

  doc.font('Helvetica').fontSize(10).fillColor(slate);
  for (const line of metaLines) {
    doc.text(line, { width: 500 });
    doc.moveDown(0.2);
  }

  const report = session.report;
  if (report) {
    doc.moveDown(0.6);
    doc.moveTo(48, doc.y).lineTo(547, doc.y).strokeColor('#E2E8F0').stroke();
    doc.moveDown(0.8);

    // Communication Assessment
    doc.fillColor(blue).font('Helvetica-Bold').fontSize(12).text('Communication Assessment');
    doc.moveDown(0.25);
    doc
      .fillColor(slate)
      .font('Helvetica')
      .fontSize(10)
      .text(report.insights.communication_assessment, { width: 500, lineGap: 2 });

    doc.moveDown(0.7);
    doc.fillColor(emerald).font('Helvetica-Bold').fontSize(12).text('Strongest Areas');
    doc.moveDown(0.25);
    doc.fillColor(slate).font('Helvetica').fontSize(10);
    for (const item of report.insights.strongest_areas) {
      doc.text(`• ${item}`, { width: 500, indent: 8 });
      doc.moveDown(0.15);
    }

    doc.moveDown(0.5);
    doc.fillColor(amber).font('Helvetica-Bold').fontSize(12).text('Areas Requiring Improvement');
    doc.moveDown(0.25);
    doc.fillColor(slate).font('Helvetica').fontSize(10);
    for (const item of report.insights.areas_requiring_improvement) {
      doc.text(`• ${item}`, { width: 500, indent: 8 });
      doc.moveDown(0.15);
    }

    doc.moveDown(0.5);
    doc.fillColor(violet).font('Helvetica-Bold').fontSize(12).text('Personalized Preparation Plan');
    doc.moveDown(0.25);
    doc.fillColor(slate).font('Helvetica').fontSize(10);
    report.insights.personalized_recommendations.forEach((rec, i) => {
      doc.text(`${i + 1}. ${rec}`, { width: 500, indent: 8 });
      doc.moveDown(0.2);
    });
  }

  // Question-by-Question Breakdown
  if (session.questions && session.questions.length > 0) {
    doc.addPage();
    doc
      .fillColor(navy)
      .font('Helvetica-Bold')
      .fontSize(15)
      .text('Question-by-Question Breakdown', 48, 48);
    doc.moveDown(0.8);

    for (const q of session.questions) {
      if (doc.y > 680) {
        doc.addPage();
      }

      doc
        .fillColor(violet)
        .font('Helvetica-Bold')
        .fontSize(11)
        .text(
          `Q${q.question_number}. [${q.category} · ${q.topic} · ${q.difficulty}]  —  Score: ${q.score !== null ? `${q.score}/10 (${q.rating})` : 'Unanswered'}`,
          { width: 500 }
        );
      doc.moveDown(0.25);

      doc.fillColor(navy).font('Helvetica-Bold').fontSize(10).text(q.question_text, { width: 500 });
      doc.moveDown(0.3);

      doc.fillColor(muted).font('Helvetica-Bold').fontSize(9).text('Your Answer:');
      doc
        .fillColor(slate)
        .font('Helvetica')
        .fontSize(9.5)
        .text(q.user_answer || 'No answer submitted.', { width: 500, lineGap: 1.5 });
      doc.moveDown(0.3);

      if (q.evaluation) {
        doc.fillColor(blue).font('Helvetica-Bold').fontSize(9).text('Sample Better Answer:');
        doc
          .fillColor(slate)
          .font('Helvetica')
          .fontSize(9.5)
          .text(q.evaluation.sample_better_answer, { width: 500, lineGap: 1.5 });
        doc.moveDown(0.25);

        doc.fillColor(emerald).font('Helvetica-Bold').fontSize(9).text('Key Tip:');
        doc
          .fillColor(slate)
          .font('Helvetica')
          .fontSize(9.5)
          .text(q.evaluation.improvement_tip, { width: 500 });
      }

      doc.moveDown(0.6);
      doc.moveTo(48, doc.y).lineTo(547, doc.y).strokeColor('#E2E8F0').stroke();
      doc.moveDown(0.7);
    }
  }

  doc.end();
}
