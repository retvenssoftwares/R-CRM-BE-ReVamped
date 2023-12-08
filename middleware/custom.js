
import crypto from 'crypto';


export async function randomString(
  length,
  chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
) {
  if (!chars) {
    throw new Error('Argument chars is undefined');
  }

  const charsLength = chars.length;
  if (charsLength > 256) {
    throw new Error(
      'Argument chars should not have more than 256 characters' +
        ', otherwise unpredictability will be broken',
    );
  }

  const randomBytes = crypto.randomBytes(length);
  const result = new Array(length);

  let cursor = 0;

  for (let i = 0; i < length; i += 1) {
    cursor += randomBytes[i];
    result[i] = chars[cursor % charsLength];
  }
  return result.join('');
}

export async function getDaysArray (start, end) {
  for (
    var arr = [], dt = new Date(start);
    dt <= new Date(end);
    dt.setDate(dt.getDate() + 1)
  ) {
    arr.push(JSON.stringify(dt).split('T')[0].slice(1));
  }
  return arr;
};

export async function calcPc (n1, n2) {
  if (n2 === 0 && n1 === 0) {
    return '0%';
  } else if (n1 === 0) {
    return '100%';
  } else if (n2 === 0) {
    return '-100%';
  } else {
    let P = n2 == 0 ? 1 : n2;
    return (
      (((n2 - n1) / P) * 100).toLocaleString('fullwide', {
        maximumFractionDigits: 3,
      }) + '%'
    );
  }
};