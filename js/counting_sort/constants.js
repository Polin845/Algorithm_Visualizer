const inputSvg = document.getElementById("inputSvg");
const countSvg = document.getElementById("countSvg");
const outputSvg = document.getElementById("outputSvg");

const generateBtn = document.getElementById("generateBtn");
const playPauseBtn = document.getElementById("playPauseBtn");
const playPauseIcon = document.getElementById("playPauseIcon");
const stepForwardBtn = document.getElementById("stepForwardBtn");
const stepBackBtn = document.getElementById("stepBackBtn");
const resetBtn = document.getElementById("resetBtn");
const speedSlider = document.getElementById("speed");
const speedLabel = document.getElementById("speedLabel");

const phaseBadge = document.getElementById("phaseBadge");
const calcLine = document.getElementById("calcLine");

const SVG_NS = "http://www.w3.org/2000/svg";

const SPEED_MS_BY_LEVEL = {
  1: 900,
  2: 600,
  3: 350,
  4: 200,
  5: 90,
};