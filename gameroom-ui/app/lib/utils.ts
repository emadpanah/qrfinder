

export const shortenAddress = (address: string, chars = 4): string => {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};


export const splitDescription = (description: string, maxLength: number): string[] => {
  const words = description.split(' ');
  let line1 = '';
  let line2 = '';

  for (const word of words) {
    if (line1.length + word.length + 1 <= maxLength) {
      line1 += word + ' ';
    } else {
      line2 += word + ' ';
    }
  }

  return [line1.trim(), line2.trim()];
};