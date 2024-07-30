

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

export const calculateRemainingDays = (expirationDate: Date): number => {
  const today = new Date();
  const expiration = new Date(expirationDate);
  const timeDiff = expiration.getTime() - today.getTime(); // getTime() returns the time in milliseconds
  const remainingDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
  return remainingDays;
};

export const calculateTotalDays = (startDate: Date, expirationDate: Date) => {
  const start = new Date(startDate);
  const expiration = new Date(expirationDate);
  const timeDiff = expiration.getTime() - start.getTime();
  const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return totalDays;
};

