/** Preserve nonzero errors that fixed decimal places would hide. */
export function measurementText(value:unknown,digits=3):string {
  if(typeof value!=='number'||!Number.isFinite(value))return '无法确认';
  if(value!==0&&Math.abs(value)<10**-digits)return value.toExponential(2);
  return value.toFixed(digits);
}
