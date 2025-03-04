import { expect } from '@esm-bundle/chai';
import { checkAndEvaluateMath } from '../../src/checkAndEvaluateMath.js';
import { runTransformSuite } from '../suites/transform-suite.spec.js';

runTransformSuite(checkAndEvaluateMath as (value: unknown) => unknown);

describe('check and evaluate math', () => {
  it('checks and evaluates math expressions', () => {
    expect(checkAndEvaluateMath('4*1.5px 4*1.5px 4*1.5px')).to.equal('6px 6px 6px');
    expect(checkAndEvaluateMath('4px')).to.equal('4px');
    expect(checkAndEvaluateMath('4 * 7')).to.equal(28);
    expect(checkAndEvaluateMath('4 * 7px')).to.equal('28px');
    expect(checkAndEvaluateMath('4 * 7rem')).to.equal('28rem');
    expect(checkAndEvaluateMath('(15 + 20 - 17 * 8 / 3) * 7px')).to.equal('-72.333px');
  });

  it('supports expression of type number', () => {
    expect(checkAndEvaluateMath(10)).to.equal(10);
  });

  it('can evaluate math expressions where more than one token has a unit, in case of px', () => {
    expect(checkAndEvaluateMath('4px * 7px')).to.equal('28px');
    expect(checkAndEvaluateMath('4 * 7px * 8px')).to.equal('224px');
  });

  it('cannot evaluate math expressions where more than one token has a unit, when unit is not px', () => {
    expect(checkAndEvaluateMath('4em * 7em')).to.equal('4em * 7em');
    expect(checkAndEvaluateMath('4 * 7em * 8em')).to.equal('4 * 7em * 8em');
    // exception for pixels, it strips px, making it 4 * 7em = 28em = 448px, where 4px * 7em would be 4px * 112px = 448px as well
    expect(checkAndEvaluateMath('4px * 7em')).to.equal('28em');
  });
  // TODO: we can make this smarter in the future. If every piece of the expression shares the same unit,
  // we can strip the unit, do the calculation, and add back the unit.
  // However, there's not really a good way to do calculations with mixed units,
  // e.g. 2em * 4rem is not possible
  it.skip('can evaluate math expressions where more than one token has a unit, as long as for each piece of the expression the unit is the same', () => {
    expect(checkAndEvaluateMath('4em * 7em')).to.equal('28em');
    expect(checkAndEvaluateMath('4pt * 7pt * 8pt')).to.equal('228pt');
    expect(checkAndEvaluateMath('4pt * 10vw * 8pt')).to.equal('4pt * 10vw * 8pt');
  });

  it('supports multi-value expressions with math expressions', () => {
    expect(checkAndEvaluateMath('8 / 4 * 7px 8 * 5px 2 * 4px')).to.equal('14px 40px 8px');
    expect(checkAndEvaluateMath('5px + 4px + 10px 3 * 2px')).to.equal('19px 6px');
    expect(checkAndEvaluateMath('5px 3 * 2px')).to.equal('5px 6px');
    expect(checkAndEvaluateMath('3 * 2px 5px')).to.equal('6px 5px');
    // smoke test: this value has spaces as well but should be handled normally
    expect(checkAndEvaluateMath('linear-gradient(90deg, #354752 0%, #0b0d0e 100%)')).to.equal(
      'linear-gradient(90deg, #354752 0%, #0b0d0e 100%)',
    );
  });

  it('supports expr-eval expressions', () => {
    expect(checkAndEvaluateMath('roundTo(4 / 7, 1)')).to.equal(0.6);
    expect(checkAndEvaluateMath('8 * 14px roundTo(4 / 7, 1)')).to.equal('112px 0.6');
    expect(checkAndEvaluateMath('roundTo(4 / 7, 1) 8 * 14px')).to.equal('0.6 112px');
    expect(checkAndEvaluateMath('min(10, 24, 5, 12, 6) 8 * 14px')).to.equal('5 112px');
    expect(checkAndEvaluateMath('ceil(roundTo(16/1.2,0)/2)*2')).to.equal(14);
  });

  it('does not unnecessarily remove wrapped quotes around font-family values', () => {
    expect(checkAndEvaluateMath(`800 italic 16px/1 'Arial Black'`)).to.equal(
      `800 italic 16px/1 'Arial Black'`,
    );
  });

  it('supports values that contain spaces and strings, e.g. a date format', () => {
    expect(checkAndEvaluateMath(`dd/MM/yyyy 'om' HH:mm`)).to.equal(`dd/MM/yyyy 'om' HH:mm`);
  });

  it('supports boolean values', () => {
    expect(checkAndEvaluateMath(false)).to.equal(false);
    expect(checkAndEvaluateMath(true)).to.equal(true);
  });
});
