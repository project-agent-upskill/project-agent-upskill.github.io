import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const SKILL_DIR = '/Users/brendanly/.codex/plugins/cache/openai-primary-runtime/presentations/26.904.11930/skills/presentations';
const workspaceDir = '/Users/brendanly/project-agent-upskill.github.io';
const TMP_DIR = path.join(workspaceDir, 'tmp/presentations/abc-tutoring');
const FINAL_PPTX = path.join(workspaceDir, 'output/pptx/abc-tutoring-dana-findings.pptx');
const RUNTIME_PYTHON = '/Users/brendanly/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';

const { resolvePresentationFont, finalizePresentation } = await import(
  pathToFileURL(path.join(SKILL_DIR, 'container_tools/artifact_tool_utils.mjs')).href,
);

const font = resolvePresentationFont({ fontFamily: 'Arial' });
const W = 1280;
const H = 720;
const C = {
  ink: '#243832',
  muted: '#60716B',
  cream: '#FBF8F1',
  paper: '#FFFDF9',
  sage: '#2F6654',
  sageDark: '#1F4E3F',
  sageSoft: '#E6F0EB',
  peach: '#F1D5C2',
  yellow: '#F7DF8D',
  line: '#D6E0DA',
  white: '#FFFFFF',
};

await fs.mkdir(TMP_DIR, { recursive: true });
await fs.mkdir(path.dirname(FINAL_PPTX), { recursive: true });

const coverCrop = new Uint8Array(await fs.readFile(path.join(TMP_DIR, 'cover-crop.png')));
const booking = new Uint8Array(await fs.readFile(path.join(TMP_DIR, 'booking.png')));
const admin = new Uint8Array(await fs.readFile(path.join(TMP_DIR, 'admin.png')));

const deck = Presentation.create({ slideSize: { width: W, height: H } });

function addText(slide, text, position, style = {}, options = {}) {
  const shape = slide.shapes.add({
    geometry: options.geometry || 'textbox',
    position,
    fill: options.fill || 'none',
    line: options.line || { fill: 'none', width: 0 },
  });
  shape.text = text;
  shape.text.style = {
    typeface: font,
    fontSize: 24,
    color: C.ink,
    autoFit: 'none',
    verticalAlignment: 'top',
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
    ...style,
  };
  return shape;
}

function addRichText(slide, paragraphs, position, style = {}, options = {}) {
  const shape = slide.shapes.add({
    geometry: options.geometry || 'textbox',
    position,
    fill: options.fill || 'none',
    line: options.line || { fill: 'none', width: 0 },
  });
  shape.text.set(paragraphs);
  shape.text.style = {
    typeface: font,
    fontSize: 24,
    color: C.ink,
    autoFit: 'none',
    verticalAlignment: 'top',
    insets: options.insets || { top: 0, right: 0, bottom: 0, left: 0 },
    ...style,
  };
  return shape;
}

function addRect(slide, position, fill, radius = false, line = { fill: 'none', width: 0 }) {
  return slide.shapes.add({ geometry: radius ? 'roundRect' : 'rect', position, fill, line });
}

function addTitle(slide, title, subtitle) {
  addText(slide, title, { left: 64, top: 44, width: 1090, height: 58 }, { fontSize: 42, bold: true, color: C.ink });
  if (subtitle) addText(slide, subtitle, { left: 64, top: 103, width: 1080, height: 42 }, { fontSize: 21, color: C.muted });
}

function addPage(slide, number) {
  addText(slide, String(number).padStart(2, '0'), { left: 1190, top: 674, width: 36, height: 20 }, { fontSize: 15, bold: true, color: C.sage, alignment: 'right' });
}

// Slide 1: cover
{
  const slide = deck.slides.add();
  slide.background.fill = C.cream;
  slide.images.add({ blob: coverCrop, contentType: 'image/png', alt: 'ABC Tutoring prototype homepage with Dana welcome note', fit: 'cover', position: { left: 670, top: 0, width: 610, height: H } });
  addRect(slide, { left: 648, top: 0, width: 22, height: H }, C.yellow);
  addText(slide, 'A FOLLOW-UP FOR DANA', { left: 68, top: 88, width: 420, height: 28 }, { fontSize: 16, bold: true, color: C.sage });
  addText(slide, 'ABC Tutoring\nwebsite prototype', { left: 68, top: 150, width: 530, height: 170 }, { fontSize: 58, bold: true, color: C.ink, lineSpacing: 0.93 });
  addText(slide, 'A simpler way for parents to find a tutor and request a session', { left: 68, top: 350, width: 500, height: 100 }, { fontSize: 27, color: C.muted, lineSpacing: 1.12 });
  addText(slide, 'Prototype findings and next steps\nSeptember 2026', { left: 68, top: 565, width: 390, height: 62 }, { fontSize: 18, color: C.sageDark, lineSpacing: 1.15 });
  slide.speakerNotes.textFrame.setText('Source: ABC Tutoring prototype screenshot captured from the local build on September 5, 2026.');
}

// Slide 2: needs
{
  const slide = deck.slides.add();
  slide.background.fill = C.paper;
  addTitle(slide, 'What I heard from you');
  addText(slide, '“I want parents to find the right tutor and book a session without everything going through my phone.”', { left: 64, top: 150, width: 510, height: 360 }, { fontSize: 34, bold: true, color: C.sageDark, lineSpacing: 1.12, verticalAlignment: 'middle', insets: { top: 30, right: 34, bottom: 30, left: 34 } }, { geometry: 'roundRect', fill: C.sageSoft });
  addText(slide, 'Dana, owner of ABC Tutoring', { left: 96, top: 535, width: 420, height: 30 }, { fontSize: 18, bold: true, color: C.sage });

  const items = [
    ['Help parents choose', 'Filter by subject and grade. Compare prices, availability and teaching format.'],
    ['Build trust', 'Show real tutor photos, personal introductions, credentials and testimonials.'],
    ['Keep you in control', 'Collect requests for your approval and let you manage tutor availability.'],
    ['Keep the first version simple', 'No payment or automated cancellation workflow. Parents can still call you when plans change.'],
  ];
  let y = 142;
  for (const [heading, body] of items) {
    addText(slide, heading, { left: 650, top: y, width: 500, height: 31 }, { fontSize: 22, bold: true, color: C.ink });
    addText(slide, body, { left: 650, top: y + 35, width: 515, height: 58 }, { fontSize: 19, color: C.muted, lineSpacing: 1.12 });
    y += 125;
  }
  addPage(slide, 2);
  slide.speakerNotes.textFrame.setText('Source: Dana interview supplied for this presentation.');
}

// Slide 3: parent flow
{
  const slide = deck.slides.add();
  slide.background.fill = C.cream;
  addTitle(slide, 'Parents can request a session in one clear flow', 'The prototype keeps the decision in one place and uses plain language throughout.');
  addRect(slide, { left: 505, top: 142, width: 729, height: 518 }, C.white, true, { fill: C.line, width: 1 });
  slide.images.add({ blob: booking, contentType: 'image/png', alt: 'Tutor profile and booking request form', fit: 'contain', position: { left: 515, top: 152, width: 709, height: 498 }, geometry: 'roundRect', borderRadius: 12 });

  const steps = [
    ['01', 'Find the right tutor', 'Use subject and grade filters, then compare rates and open times.'],
    ['02', 'Choose the session', 'Pick an available time and choose online or in person.'],
    ['03', 'Share the essentials', 'Enter the parent’s contact details and the student’s first name, grade and subject.'],
    ['04', 'Wait for your reply', 'The parent sees “pending approval” while you review the request.'],
  ];
  let y = 166;
  for (const [number, heading, body] of steps) {
    addText(slide, number, { left: 64, top: y, width: 55, height: 34 }, { fontSize: 25, bold: true, color: C.sage });
    addText(slide, heading, { left: 128, top: y, width: 320, height: 29 }, { fontSize: 22, bold: true, color: C.ink });
    addText(slide, body, { left: 128, top: y + 34, width: 320, height: 64 }, { fontSize: 18, color: C.muted, lineSpacing: 1.1 });
    y += 118;
  }
  addText(slide, 'No payment is collected.', { left: 128, top: 640, width: 310, height: 26 }, { fontSize: 19, bold: true, color: C.sageDark });
  addPage(slide, 3);
  slide.speakerNotes.textFrame.setText('Source: ABC Tutoring prototype screenshot. The demo tutor portrait is an Unsplash photograph: https://images.unsplash.com/photo-1494790108377-be9c29b29330');
}

// Slide 4: admin view
{
  const slide = deck.slides.add();
  slide.background.fill = C.sageSoft;
  addTitle(slide, 'Your booking desk keeps you in control', 'A simple private view gives you the final say over every request.');
  addRect(slide, { left: 54, top: 158, width: 742, height: 475 }, C.white, true, { fill: C.line, width: 1 });
  slide.images.add({ blob: admin, contentType: 'image/png', alt: 'Dana admin view with a pending booking request', fit: 'cover', position: { left: 64, top: 168, width: 722, height: 455 }, crop: { left: 0, top: 0, right: 0, bottom: 0.08 }, geometry: 'roundRect', borderRadius: 12 });

  const items = [
    ['See every request', 'Parent, student, tutor, subject, format and requested time appear together.'],
    ['Approve on your schedule', 'A request stays pending until you decide. Approval removes that time from availability.'],
    ['Keep tutor times current', 'You can add or remove each tutor’s available times yourself.'],
  ];
  let y = 180;
  for (const [heading, body] of items) {
    addText(slide, heading, { left: 846, top: y, width: 355, height: 32 }, { fontSize: 23, bold: true, color: C.ink });
    addText(slide, body, { left: 846, top: y + 38, width: 355, height: 74 }, { fontSize: 19, color: C.muted, lineSpacing: 1.12 });
    y += 132;
  }
  addText(slide, 'Prototype note', { left: 840, top: 578, width: 160, height: 23 }, { fontSize: 16, bold: true, color: C.sageDark });
  addText(slide, 'Notifications and schedule updates are simulated and saved on one device for now.', { left: 840, top: 607, width: 355, height: 58 }, { fontSize: 18, color: C.sageDark, lineSpacing: 1.1 });
  addPage(slide, 4);
  slide.speakerNotes.textFrame.setText('Source: ABC Tutoring prototype screenshot. Demo tutor images shown in the screenshot are from Unsplash: https://images.unsplash.com/photo-1494790108377-be9c29b29330, https://images.unsplash.com/photo-1566753323558-f4e0952af115, and https://images.unsplash.com/photo-1534528741775-53994a69daeb');
}

// Slide 5: analytics and next steps
{
  const slide = deck.slides.add();
  slide.background.fill = C.paper;
  addTitle(slide, 'What you can learn from the website', 'PostHog follows the parent journey without collecting names, emails or student details.');

  addRect(slide, { left: 126, top: 205, width: 1018, height: 4 }, C.line);
  const funnel = [
    ['Directory visits', 'Parents begin browsing'],
    ['Profile views', 'Tutors draw interest'],
    ['Booking starts', 'Parents choose a time'],
    ['Requests sent', 'Parents complete the form'],
  ];
  let x = 64;
  for (let i = 0; i < funnel.length; i += 1) {
    const [heading, body] = funnel[i];
    addText(slide, String(i + 1), { left: x + 94, top: 166, width: 48, height: 48 }, { fontSize: 22, bold: true, color: C.white, alignment: 'center', verticalAlignment: 'middle', insets: { top: 0, right: 0, bottom: 0, left: 0 } }, { geometry: 'ellipse', fill: C.sage });
    addText(slide, heading, { left: x, top: 232, width: 236, height: 30 }, { fontSize: 21, bold: true, color: C.ink, alignment: 'center' });
    addText(slide, body, { left: x, top: 269, width: 236, height: 42 }, { fontSize: 17, color: C.muted, alignment: 'center' });
    x += 310;
  }

  addText(slide, 'Questions the data answers', { left: 64, top: 355, width: 470, height: 35 }, { fontSize: 26, bold: true, color: C.ink });
  addRichText(slide, [
    [{ run: 'Which subjects', textStyle: { bold: true } }, ' are families looking for?'],
    [{ run: 'Which tutors', textStyle: { bold: true } }, ' receive the most profile views?'],
    [{ run: 'Where do parents leave', textStyle: { bold: true } }, ' before sending a request?'],
    [{ run: 'Does Facebook', textStyle: { bold: true } }, ' produce visits and booking requests?'],
  ], { left: 64, top: 405, width: 525, height: 175 }, { fontSize: 20, color: C.muted, lineSpacing: 1.18 });

  addText(slide, 'Before a real launch', { left: 690, top: 355, width: 470, height: 35 }, { fontSize: 26, bold: true, color: C.ink });
  addRichText(slide, [
    [{ run: 'Shared scheduling', textStyle: { bold: true } }, ' so every visitor sees the same bookings and open times.'],
    [{ run: 'Private sign-in', textStyle: { bold: true } }, ' so only you can open the admin view.'],
    [{ run: 'Real notifications', textStyle: { bold: true } }, ' by email or text when a parent sends a request.'],
  ], { left: 690, top: 405, width: 510, height: 150 }, { fontSize: 20, color: C.muted, lineSpacing: 1.18 });

  addText(slide, 'The prototype is ready to review with Dana and a small group of parents.', { left: 64, top: 624, width: 1080, height: 36 }, { fontSize: 23, bold: true, color: C.sageDark });
  addPage(slide, 5);
  slide.speakerNotes.textFrame.setText('Source: Dana interview and the analytics event plan implemented in the ABC Tutoring prototype. No external performance data is presented.');
}

const stagingDir = path.join(workspaceDir, '.codex-finalizer');
await fs.mkdir(stagingDir, { recursive: true });
const candidatePath = path.join(stagingDir, 'abc-tutoring-dana-findings-candidate.pptx');
await (await PresentationFile.exportPptx(deck)).save(candidatePath);

for (let i = 0; i < deck.slides.length; i += 1) {
  const slide = deck.slides.getItemAt(i);
  const preview = await deck.export({ slide, format: 'png', scale: 1 });
  await fs.writeFile(path.join(TMP_DIR, `preview-${i + 1}.png`), new Uint8Array(await preview.arrayBuffer()));
}

const requirements = {
  explicitTotalSlideCount: 5,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
};

const result = await finalizePresentation({
  ...requirements,
  workspaceDir,
  candidatePath,
  finalPath: FINAL_PPTX,
  pythonExecutable: RUNTIME_PYTHON,
  integrityValidatorPath: path.join(SKILL_DIR, 'container_tools/inspect_presentation_package_integrity.py'),
  layoutValidatorPath: path.join(SKILL_DIR, 'container_tools/inspect_presentation_layout_geometry.py'),
  layoutArgs: ['--expected-slide-size-emu', '12192000,6858000', '--validate-bullet-geometry', '--validate-heading-fit'],
  requiredNativeTableOwnerSlides: [],
  fontPolicy: { basis: 'design', families: [font] },
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, 'abc-tutoring-dana-findings.validation.json'),
});

console.log(JSON.stringify({ font, finalPath: FINAL_PPTX, validation: result }, null, 2));
