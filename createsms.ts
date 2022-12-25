const MAX_FRAGMENTS_NUMBER = 9999;

function createSuffix(fragmentCount: number = 1, fragmentsNumber: number = 1): string {
  return `${fragmentCount}/${fragmentsNumber}`;
}

function calcFragmentsNumber(text: string, limit: number) {
  let fragmentsNumber = 0;
  const fragmentsDigitLength = Math.ceil(text.length / limit).toString().length; //кол-во знаков в всего смс
  let smsLength = 0;
  const words = text.split(' ');
  words.forEach((word, index) => {
    const countLength = `${fragmentsNumber}`.length; // кол-во знаков в номер фрагмента
    const suffixLength = countLength + fragmentsDigitLength + 2; //2 = пробел перед суффиксом + /
    if (smsLength + word.length + 1 + suffixLength <= limit) {
      // word.length + 1 - длина слова и пробел после него
      smsLength = smsLength + word.length + 1;

      const isLastWord = index === words.length - 1; //последнее слово в смс
      if (isLastWord) {
        fragmentsNumber = fragmentsNumber + 1;
      }
    } else {
      fragmentsNumber = fragmentsNumber + 1;
      smsLength = word.length;
    }
  });

  if (fragmentsNumber > MAX_FRAGMENTS_NUMBER) {
    throw new Error('Очень много СМС!');
  }

  return fragmentsNumber;
}

export function createSMS(rawText: string, limit: number = 140) {
  if (!rawText) {
    throw new Error('Текст обязателен!');
  }

  const text = rawText.trim();
  const isMultiFragments = text.length > limit;
  const output: string[] = [];

  // Уложились в 1 смс
  if (!isMultiFragments) {
    output.push(text);
    return output;
  }
  //--------------------------

  let sms: string = '';
  const words = text.split(' ');
  const fragmentsNumber = calcFragmentsNumber(text, limit);
  let fragmentCount = 1;
  const getSuffix = () => createSuffix(fragmentCount, fragmentsNumber);

  for (let i = 0; i < words.length; i++) {
    if (sms.length + words[i].length + getSuffix().length + 1 <= limit) {
      sms = `${sms}${words[i]} `;
      const isLastWord = words.length - 1 === i;
      if (isLastWord) {
        sms = `${sms}${getSuffix()}`;
        output.push(sms.trimStart());
        fragmentCount++;
      }
    } else {
      sms = `${sms}${getSuffix()}`;
      output.push(sms.trimStart());
      sms = `${words[i]} `;
      fragmentCount++;
    }
  }

  return output;
}
