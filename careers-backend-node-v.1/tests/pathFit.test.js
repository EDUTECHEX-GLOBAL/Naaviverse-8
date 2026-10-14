const assert = require('assert');
const { assessPathFit, assessMultiplePaths, FACTOR_WEIGHTS } = require('../services/PathFitAssessmentService');

console.log('--- RUNNING PATH FIT ASSESSMENT TESTS ---');

// Test 1: Full Match Profile
{
  const userProfile = {
    grade: '11',
    curriculum: 'CBSE',
    stream: 'MPC',
    performance: '86% - 95%',
    financialSituation: '25L-75L',
    personality: 'investigative',
    country: 'India',
    city: 'Hyderabad',
  };

  const path = {
    _id: '507f1f77bcf86cd799439011',
    nameOfPath: 'Computer Science & AI Career Pathway',
    program: 'Engineering & Computing',
    description: 'Premier path for aspiring software engineers and AI developers',
    grade: ['11', '12'],
    curriculum: ['CBSE', 'IB'],
    stream: ['MPC'],
    financialSituation: ['25L-75L'],
    personality: 'investigative',
    country: 'India',
    the_ids: [{ step_id: '1' }, { step_id: '2' }],
  };

  const steps = [
    { macro_name: 'Foundation in Discrete Mathematics & Logic', macro_cost: 'free' },
    { macro_name: 'Introduction to Algorithms and Data Structures', macro_cost: 'free' },
  ];

  const result = assessPathFit(userProfile, path, steps);
  assert.strictEqual(result.fitCategory, 'Strong Fit', 'Should be Strong Fit for ideal match');
  assert.ok(result.overallScore >= 85, 'Overall score should be >= 85');
  assert.strictEqual(result.badgeTone, 'mint', 'Badge tone should be mint');
  assert.strictEqual(result.eligibilityStatus, 'Eligible', 'Should be Eligible');
  assert.strictEqual(result.dataCompleteness, 100, 'Data completeness should be 100%');
  assert.ok(result.matchedFactors.length >= 4, 'Should have multiple matched factors');
  assert.strictEqual(result.gapsToAddress.length, 0, 'Should have zero gaps');
  console.log('Test 1 Passed: Full match scenario evaluated accurately.');
}

// Test 2: Incomplete User Profile (Missing data must not cause false negative)
{
  const sparseProfile = {
    email: 'newbie@example.com',
  };

  const path = {
    _id: '507f1f77bcf86cd799439012',
    nameOfPath: 'Medicine & Healthcare Pathway',
    grade: ['11', '12'],
    stream: ['BIPC'],
  };

  const result = assessPathFit(sparseProfile, path, []);
  assert.strictEqual(result.fitCategory, 'Needs Verification', 'Incomplete profile should yield Needs Verification');
  assert.strictEqual(result.badgeTone, 'lavender', 'Badge tone should be lavender for incomplete info');
  assert.ok(result.dataCompleteness < 40, 'Completeness should reflect missing profile info');
  assert.ok(result.factors.some((f) => f.status === 'unknown'), 'Factors without data should be unknown');
  console.log('Test 2 Passed: Incomplete profile handled transparently with no fabricated penalties.');
}

// Test 3: Stream Prerequisite Mismatch
{
  const hecProfile = {
    grade: '12',
    stream: 'HEC',
    curriculum: 'CBSE',
    financialSituation: '0-25L',
  };

  const engineeringPath = {
    _id: '507f1f77bcf86cd799439013',
    nameOfPath: 'Aerospace Engineering Track',
    grade: ['11', '12'],
    stream: ['MPC'], // requires MPC
    financialSituation: ['0-25L'],
  };

  const result = assessPathFit(hecProfile, engineeringPath, []);
  assert.strictEqual(result.eligibilityStatus, 'Check Academic Prerequisites', 'Should flag prerequisite mismatch');
  assert.strictEqual(result.badgeTone, 'yellow', 'Badge tone should be yellow');
  assert.ok(result.gapsToAddress.some((g) => g.title.includes('Stream')), 'Should explicitly list stream gap');
  console.log('Test 3 Passed: Academic prerequisite mismatch flagged correctly.');
}

// Test 4: Batch Assessment for Explore Paths Cards
{
  const userProfile = {
    grade: '11',
    stream: 'MPC',
    curriculum: 'CBSE',
  };

  const paths = [
    { _id: '1', nameOfPath: 'Path A', grade: ['11'], stream: ['MPC'] },
    { _id: '2', nameOfPath: 'Path B', grade: ['9'], stream: ['HEC'] },
  ];

  const batchResults = assessMultiplePaths(userProfile, paths);
  assert.strictEqual(batchResults.length, 2, 'Should assess all paths');
  assert.strictEqual(batchResults[0].fitCategory, 'Strong Fit', 'Path A should be Strong Fit');
  assert.ok(batchResults[0].cardHighlight.includes('MPC'), 'Card highlight should mention MPC');
  console.log('Test 4 Passed: Batch assessment for cards succeeded.');
}

console.log('--- ALL PATH FIT TESTS PASSED SUCCESSFULLY! ---');
