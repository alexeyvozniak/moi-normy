'use strict';

const assert=require('node:assert/strict');
const domain=require('../domain.js');

assert.equal(domain.daysLeft('2026-08-19','2026-08-12'),8,'deadline includes today');
assert.equal(domain.readingTarget(208,'2026-08-19','2026-08-12'),26,'208 pages over 8 days');
assert.equal(domain.readingTarget(208,'2026-08-18','2026-08-12'),30,'208 pages over 7 days');
assert.equal(domain.readingTarget(168,'2026-08-18','2026-08-12'),24,'168 pages over 7 days');
assert.equal(domain.readingTarget(0,'2026-08-19','2026-08-12'),0,'finished book has zero target');

assert.equal(domain.accrualCount({lastKey:'2026-08-11',todayKey:'2026-08-12',period:'daily'}),1);
assert.equal(domain.accrualCount({lastKey:'2026-08-05',todayKey:'2026-08-12',period:'weekly'}),1);
assert.equal(domain.accrualCount({lastKey:'2026-08-06',todayKey:'2026-08-12',period:'weekly'}),0);
assert.equal(domain.accrualCount({lastKey:'2026-08-06',todayKey:'2026-08-12',period:'interval',intervalDays:3}),2);
assert.equal(domain.accrualCount({lastKey:'2026-07-12',todayKey:'2026-08-12',period:'monthly'}),1);
assert.equal(domain.accrualCount({lastKey:'2026-07-31',todayKey:'2026-08-12',period:'monthly'}),0);

assert.equal(domain.prayerCue(1),'');
assert.equal(domain.prayerCue(10),'ten');
assert.equal(domain.prayerCue(80),'ten','80 is an ordinary ten milestone, never a hundred milestone');
assert.notEqual(domain.prayerCue(80),'hundred');
assert.equal(domain.prayerCue(99),'');
assert.equal(domain.prayerCue(100),'hundred');
assert.equal(domain.prayerCue(110),'ten');
assert.equal(domain.prayerCue(200),'hundred');

console.log('Domain logic: OK');
