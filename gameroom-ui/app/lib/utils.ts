

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

export const calculateRemainingDays = (expirationTimestamp: number): number => {
  const todayTimestamp = Date.now();
  const timeDiff = expirationTimestamp - todayTimestamp; // Difference in milliseconds
  const remainingDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
  return remainingDays;
};

export const calculateTotalDays = (startTimestamp: number, expirationTimestamp: number): number => {
  const timeDiff = expirationTimestamp - startTimestamp; // Difference in milliseconds
  const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
  return totalDays;
};


export const shortenUrl = (url: string) => {
  const length = url.length;
  if (length <= 30) {
    return url;
  }
  return `${url.slice(0, 15)}...${url.slice(length - 10, length)}`;
};
