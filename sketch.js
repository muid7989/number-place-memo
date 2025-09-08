let time;
let frameCountBuffer = 0;
let fps = 0;

const CANVAS_W = 960;
const CANVAS_H = 1280;

const GRID_SIZE = 64;
const BASE_X = GRID_SIZE*0.75;
const BASE_Y = GRID_SIZE*0.75;
const UNIT_SIZE = GRID_SIZE*1.5;

const BUTTON_OFFSET = 8;
const BUTTON_W = GRID_SIZE*2;
const BUTTON_H = GRID_SIZE*1;
const BUTTON_Y = GRID_SIZE*8;
const BUTTON_X = GRID_SIZE*13;
const BUTTON_M = 24;

const CURSOR_SIZE = GRID_SIZE*1.5;
const CURSOR_COLOR = 'orange';
const CURSOR_STROKE = 8;
const CURSOR_MIN_X = 0;
const CURSOR_MIN_Y = 0;
const CURSOR_MAX_X = 8;
const CURSOR_MAX_Y = 8;
const MOVE_UNIT = GRID_SIZE*1.5;
const CURSOR_BASE_X = BASE_X+MOVE_UNIT*0.5;
const CURSOR_BASE_Y = BASE_Y+MOVE_UNIT*0.5;
const MOVE_RANGE = 3;

const JOYSTICK_X = CANVAS_W-GRID_SIZE*2;
const JOYSTICK_Y = CANVAS_H-GRID_SIZE*2;
const JOYSTICK_SIZE = GRID_SIZE*3;
const JOYSTICK_RANGE = GRID_SIZE*2;
const JOYSTICK_SUM_C = 4;
let joystick;
const IMAGE_X = BASE_X;
const IMAGE_Y = BASE_Y;
const IMAGE_W = UNIT_SIZE*9;

const NUM_BUTTON_W = GRID_SIZE*1.2;
const NUM_BUTTON_H = GRID_SIZE;
const NUM_BUTTON_X = GRID_SIZE*1;
const NUM_BUTTON_Y = GRID_SIZE*15;
const NUM_BUTTON_INT = GRID_SIZE*1.5;
let numButton = [];
let tempNumButton = [];
const TEMP_MARK_POS = {
	1: {x: -1, y: -1},
	2: {x: 0, y: -1},
	3: {x: 1, y: -1},
	4: {x: -1, y: 0},
	5: {x: 0, y: 0},
	6: {x: 1, y: 0},
	7: {x: -1, y: 1},
	8: {x: 0, y: 1},
	9: {x: 1, y: 1}
};
const TEMP_MARK_OFFSET = 32;

let markRecord;
let markData;
let qImage;
let fileInput;

const DEBUG = true;
const DEBUG_VIEW_X = 40;
const DEBUG_VIEW_Y = 20;
const DEBUG_VIEW_H = 20;

function preload() {
	qImage = loadImage('./sample.JPG');
}
function handleFile(file) {
	if (file.type == 'image') {
		qImage = loadImage(file.data);
	}
}

function setup() {
	createCanvas(CANVAS_W, CANVAS_H);
	time = millis();
	rectMode(CENTER);

	textAlign(CENTER,CENTER);
	joystickInit();
	numButtonInit();
	cursorInit();
	markData = [];
	markRecord = [];
	fileInput = createFileInput(handleFile);
	fileInput.style('font-size', '32px');
	fileInput.position(24, CANVAS_H-64);
}
function buttonInit(text, w, h, x, y) {
	let button = createButton(text);
	button.size(w,h);
	button.position(x+BUTTON_OFFSET,y+BUTTON_OFFSET);
	button.style('font-size', '48px');
	return button;
}
function cursorInit() {
	cursor = {};
	cursor.pos = {};
	cursor.pos.x = CURSOR_MIN_X;
	cursor.pos.y = CURSOR_MIN_Y;
	cursor.tPos = {};
}
function numButtonInit() {
	for (let i=0; i<9; i++){
		let button = createButton(i+1);
		button.size(NUM_BUTTON_W, NUM_BUTTON_H);
		button.position(NUM_BUTTON_X+NUM_BUTTON_INT*i, NUM_BUTTON_Y);
		button.style('font-size', '48px');
		button.mousePressed(function() {
			numButtonFn(i+1);
		});
		numButton.push(button);
		let tButton = createButton(i+1);
		tButton.size(NUM_BUTTON_W, NUM_BUTTON_H);
		tButton.position(NUM_BUTTON_X+NUM_BUTTON_INT*i, NUM_BUTTON_Y+NUM_BUTTON_INT);
		tButton.style('color', 'gray');
		tButton.style('font-size', '48px');
		tButton.mousePressed(function() {
			tempNumButtonFn(i+1);
		});
		tempNumButton.push(tButton);
	}
}
function numButtonFn(n) {
	const mark = {
		x: cursor.pos.x, y: cursor.pos.y,
		num: n, temp: false
	};
	markRecord.push(mark);
	addMarkData(mark);
}
function tempNumButtonFn(n) {
	const mark = {
		x: cursor.pos.x, y: cursor.pos.y,
		num: n, temp: true
	};
	markRecord.push(mark);
	addMarkData(mark);
}
function addMarkData(mark) {
	const r = searchMarkData(mark.x, mark.y);
	if (r<0){
		let data = {};
		data.x = mark.x;
		data.y = mark.y;
		data.num = [];
		data.tempNum = [];
		if (mark.temp){
			data.tempNum.push(mark.num);
		}else{
			data.num.push(mark.num);
		}
		markData.push(data);
	}else{
		if (mark.temp){
			const l = markData[r].tempNum.length;
			for (let i=0; i<markData[r].tempNum.length; i++){
				if (mark.num==markData[r].tempNum[i]){
					markData[r].tempNum.splice(i,1);
					break;
				}
			}
			if (l==markData[r].tempNum.length){
				markData[r].tempNum.push(mark.num);
			}
		}else{
			const l = markData[r].num.length;
			for (let i=0; i<markData[r].num.length; i++){
				if (mark.num==markData[r].num[i]){
					markData[r].num.splice(i,1);
					break;
				}
			}
			if (l==markData[r].num.length){
				markData[r].num.push(mark.num);
			}
		}
	}
//	console.log(markData);
}
function searchMarkData(x, y) {
	for (let i=0; i<markData.length; i++){
		if ((x==markData[i].x) && (y==markData[i].y)){
			return i;
		}
	}
	return -1;
}
function joystickInit() {
	joystick = {};
	joystick.pos = {};
	joystick.pos.x = JOYSTICK_X;
	joystick.pos.y = JOYSTICK_Y;
	joystick.offset = {};
	joystick.offset.x = 0;
	joystick.offset.y = 0;
	joystick.sum = {};
	joystick.sum.x = 0;
	joystick.sum.y = 0;
	joystick.control = false;
}
function cursorMove(x, y) {
	cursor.pos.x += x;
	if (cursor.pos.x>=CURSOR_MAX_X){
		cursor.pos.x = CURSOR_MAX_X;
	}else if (cursor.pos.x<=CURSOR_MIN_X){
		cursor.pos.x = CURSOR_MIN_X;
	}
	cursor.pos.y += y;
	if (cursor.pos.y>=CURSOR_MAX_Y){
		cursor.pos.y = CURSOR_MAX_Y;
	}else if (cursor.pos.y<=CURSOR_MIN_Y){
		cursor.pos.y = CURSOR_MIN_Y;
	}
}
function draw() {
	background(32);
	let current = millis();
	if ( (current-time)>=1000 ){
		time += 1000;
		fps = frameCount - frameCountBuffer;
		frameCountBuffer = frameCount;
	}
	if (DEBUG){
		stroke(128);
		strokeWeight(1);
		for (let i=0; i<CANVAS_H/GRID_SIZE; i++){
			line(0, i*GRID_SIZE, CANVAS_W, i*GRID_SIZE);
		}
		for (let i=0; i<CANVAS_W/GRID_SIZE; i++){
			line(i*GRID_SIZE, 0, i*GRID_SIZE, CANVAS_H);
		}
	}
	image(qImage, IMAGE_X, IMAGE_Y, IMAGE_W, IMAGE_W);
	stroke(200);
	strokeWeight(3);
	for (let i=0; i<10; i++){
		line(BASE_X, BASE_Y+UNIT_SIZE*i, BASE_X+UNIT_SIZE*9, BASE_Y+UNIT_SIZE*i);
	}
	for (let i=0; i<10; i++){
		line(BASE_X+UNIT_SIZE*i, BASE_Y, BASE_X+UNIT_SIZE*i, BASE_Y+UNIT_SIZE*9);
	}
	if (joystick.control){
		if (joystick.pos.x>=JOYSTICK_X+JOYSTICK_RANGE){
			joystick.pos.x = JOYSTICK_X+JOYSTICK_RANGE;
		}else if(joystick.pos.x<=JOYSTICK_X-JOYSTICK_RANGE){
			joystick.pos.x = JOYSTICK_X-JOYSTICK_RANGE;
		}	
		if (joystick.pos.y>=JOYSTICK_Y+JOYSTICK_RANGE){
			joystick.pos.y = JOYSTICK_Y+JOYSTICK_RANGE;
		}else if(joystick.pos.y<=JOYSTICK_Y-JOYSTICK_RANGE){
			joystick.pos.y = JOYSTICK_Y-JOYSTICK_RANGE;
		}
	}else{
		joystick.pos.x = JOYSTICK_X;
		joystick.pos.y = JOYSTICK_Y;
	}
	joystick.x = (joystick.pos.x-JOYSTICK_X)/JOYSTICK_RANGE;
	joystick.y = (joystick.pos.y-JOYSTICK_Y)/JOYSTICK_RANGE;
	if (joystick.control){
		cursor.pos.x = cursor.tPos.x;
		cursor.pos.y = cursor.tPos.y;
		cursorMove(int(joystick.x*MOVE_RANGE), int(joystick.y*MOVE_RANGE));
	}else{
		cursor.tPos.x = cursor.pos.x;
		cursor.tPos.y = cursor.pos.y;
	}
	noStroke();
	for (let i=0; i<markData.length; i++){
		const cx = CURSOR_BASE_X+MOVE_UNIT*markData[i].x;
		const cy = CURSOR_BASE_Y+MOVE_UNIT*markData[i].y;
		if (markData[i].num.length==0){
			fill(48);
			textSize(24);
			for (let j=0; j<markData[i].tempNum.length; j++){
				const tx = cx + TEMP_MARK_OFFSET*TEMP_MARK_POS[markData[i].tempNum[j]].x;
				const ty = cy + TEMP_MARK_OFFSET*TEMP_MARK_POS[markData[i].tempNum[j]].y;
				text(markData[i].tempNum[j], tx, ty);
			}
		}
		fill(0);
		textSize(72);
		for (let j=0; j<markData[i].num.length; j++){
			text(markData[i].num[j], cx, cy);
		}
	}
	noFill();
	stroke(CURSOR_COLOR);
	strokeWeight(CURSOR_STROKE);
	rect(CURSOR_BASE_X+MOVE_UNIT*cursor.pos.x, CURSOR_BASE_Y+MOVE_UNIT*cursor.pos.y, CURSOR_SIZE);
	fill(200);
	noStroke();
	circle(joystick.pos.x, joystick.pos.y, JOYSTICK_SIZE);

	fill(255);
	stroke(255);
	textSize(16);
	strokeWeight(1);
	let debugY = DEBUG_VIEW_Y;
	text('fps:'+fps, DEBUG_VIEW_X, debugY);
	debugY += DEBUG_VIEW_H;
	text(joystick.x.toFixed(2)+','+joystick.y.toFixed(2), DEBUG_VIEW_X, debugY);
}
function touchStarted() {
	let tp = [];
	for (let i=0; i<touches.length;i++) {
		if (tp[i]==null){
			tp[i] = [];
		}
		tp[i].x = touches[i].x;
		tp[i].y = touches[i].y;
	}
	let tx, ty;
	if (tp[0]!=null){
		tx = tp[0].x;
		ty = tp[0].y;
	}else{
		tx = mouseX;
		ty = mouseY;
	}
	const d = dist(tx, ty, joystick.pos.x, joystick.pos.y);
	if (d<=JOYSTICK_SIZE/2){
		joystick.control = true;
		joystick.offset.x = joystick.pos.x - tx;
		joystick.offset.y = joystick.pos.y - ty;
	}
}
function touchEnded() {
	joystick.control = false;
}
function touchMoved() {
	let tp = [];
	for (let i=0; i<touches.length;i++) {
		if (tp[i]==null){
			tp[i] = [];
		}
		tp[i].x = touches[i].x;
		tp[i].y = touches[i].y;
	}
	let tx, ty;
	if (tp[0]!=null){
		tx = tp[0].x;
		ty = tp[0].y;
	}else{
		tx = mouseX;
		ty = mouseY;
	}
	if (joystick.control){
		joystick.pos.x = tx + joystick.offset.x;
		joystick.pos.y = ty + joystick.offset.y;
	}
	return false;
}