var locale = require("locale");
const Radius = { "center": 3, "hour": 78, "min": 95, "sec": 102 };
const Center = { "x": 120, "y": 132 };
const Color = { "bkg": 0, "sec": "#4c4cFF", "secHand": "#FF1D1D", "hand": -1, "date": -1 };
const p1 = Math.PI / 2;
const r3 = 3;
const pRad = Math.PI / 180;
let currentDate = null;
let oldDate = null;
let timer = null;

function rotatePoint(x, y, r) {
    rad = -1 * r * pRad;
    var sin = Math.sin(rad);
    var cos = Math.cos(rad);
    xn = ((Center.x + x * cos - y * sin) + 0.5) | 0;
    yn = ((Center.y + x * sin - y * cos) + 0.5) | 0;
    p = [xn, yn];
    return p;
}

function seconds(i) {
  radius = (i % 5) ? 1 : 10;
  point1 = rotatePoint(0, Radius.sec, i * 6);
  point2 = rotatePoint(0, Radius.sec -radius, i * 6);
  g.drawLine(point1[0], point1[1], point2[0], point2[1]);
}

function secondHand(i) {
  point1 = rotatePoint(0, -20, i * 6);
  point2 = rotatePoint(0, Radius.sec, i * 6);
  g.drawLine(point1[0], point1[1], point2[0], point2[1]);
  g.fillCircle(Center.x, Center.y, Radius.center);
}

function hand(rad, r1, r2) {
  a = rad * pRad;
  g.fillPoly([
    Math.round(Center.x + Math.sin(a) * r1),
    Math.round(Center.y - Math.cos(a) * r1),
    Math.round(Center.x + Math.sin(a + p1) * r3),
    Math.round(Center.y - Math.cos(a + p1) * r3),
    Math.round(Center.x + Math.sin(a) * r2),
    Math.round(Center.y - Math.cos(a) * r2),
    Math.round(Center.x + Math.sin(a - p1) * r3),
    Math.round(Center.y - Math.cos(a - p1) * r3)
  ]);
}

function onSecond() {
  g.setColor(Color.bkg);
  // erase last hours hand
  if (oldDate != currentDate && currentDate.getMinutes() == 59 && currentDate.getSeconds() == 59) {
    drawHoursHand();
  }
  // erase last minutes hand
  if (oldDate != currentDate && currentDate.getSeconds() == 59) {
    drawMinutesHand();
  }
  // erase last seconds hand
  if (oldDate != currentDate) {
    secondHand(currentDate.getSeconds());
  }
  // redraw clock
  g.setColor(Color.sec);
  seconds(currentDate.getSeconds());

  oldDate = currentDate;
  currentDate = new Date();
  // draw seconds hand
  g.setColor(Color.hand);
  // draw Date
  drawDate();
  // draw hours hand
  drawHoursHand();
  // draw minutess hand
  drawMinutesHand();
  g.setColor(Color.secHand);
  secondHand(currentDate.getSeconds());
}

function drawMinutesHand() {
  hand((currentDate.getMinutes() * 6), -10, Radius.min);
}

function drawHoursHand() {
  hand((360 * (currentDate.getHours() + currentDate.getMinutes() / 60)) / 12, -10, Radius.hour);
}

function drawDate() {
  g.setColor(Color.date);
  g.setFont('6x8', 1);

  const dayString = locale.dow(currentDate, true);
  // pad left date
  const dateString = (currentDate.getDate() < 10 ? '0' : '') + currentDate.getDate().toString();
  const dateDisplay = `${dayString} ${dateString}`;
  const l = Center.x + (102 - g.stringWidth(dateDisplay)) / 2;
  const t = Center.y -4;
  g.drawString(dateDisplay, l, t, false);
}

function drawClock() {
  g.setColor(Color.sec);
  for (let i = 0; i < 60; i++) {
    seconds(i);
  }
  timer = setInterval(onSecond, 1000);
}

Bangle.on('lcdPower', function(on) {
  if (on)
    if (timer) {
      clearInterval(timer);
    }
    drawClock();
});

g.clear();
drawClock();
Bangle.loadWidgets();
Bangle.drawWidgets();

// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });
