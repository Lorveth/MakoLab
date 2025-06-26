import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-the-license-plate-problem',
  imports: [],
  templateUrl: './the-license-plate-problem.component.html',
  styleUrl: './the-license-plate-problem.component.scss',
})
export class TheLicensePlateProblemComponent implements OnInit {
  ngOnInit() {
    console.log(this.getNthPlate(1000027));
  }

  getNthPlate(n: number): string {
    if (n < 0) throw new Error('n must be >= 0');

    const totalLength = 6;
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let remainingIndex: number = n;

    for (let digitsCount: number = totalLength; digitsCount >= 0; digitsCount--) {
      const lettersCount: number = totalLength - digitsCount;
      const digitCombNum: number = Math.pow(10, digitsCount);
      const letterCombNum: number = Math.pow(26, lettersCount);
      const possibleCombNum: number = digitCombNum * letterCombNum;

      if (remainingIndex < possibleCombNum) {
        const digitValue: number = remainingIndex % letterCombNum;
        const letterIndex: number = Math.floor(remainingIndex / letterCombNum);

        const digitPart: string = digitValue.toString().padStart(digitsCount, '0');
        let letterPart: string = '';
        let li: number = letterIndex;

        for (let i: number = 0; i < lettersCount; i++) {
          letterPart = letters[li % 26] + letterPart;
          li = Math.floor(li / 26);
        }

        letterPart = letterPart.padStart(lettersCount, 'A');

        return digitPart + letterPart;
      } else {
        remainingIndex -= possibleCombNum;
      }
    }

    throw new Error('Index too large');
  }
}
