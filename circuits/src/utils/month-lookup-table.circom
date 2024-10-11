pragma circom 2.1.5;

include "circomlib/circuits/comparators.circom";

template MonthLookup() {
    signal input packedMonth;
    signal output monthNumber;

    // Definisci i segnali per ciascun mese
    signal isJan, isFeb, isMar, isApr, isMay, isJun, isJul, isAug, isSep, isOct, isNov, isDec;

    // Istanzia i componenti IsEqual per ciascun mese
    component eqJan = IsEqual();
    eqJan.in[0] <== packedMonth;
    eqJan.in[1] <== 7237482; // "Jan" (ASCII: [74, 97, 110])
    isJan <== eqJan.out;

    component eqFeb = IsEqual();
    eqFeb.in[0] <== packedMonth;
    eqFeb.in[1] <== 6447478; // "Feb" (ASCII: [70, 101, 98])
    isFeb <== eqFeb.out;

    component eqMar = IsEqual();
    eqMar.in[0] <== packedMonth;
    eqMar.in[1] <== 7497573; // "Mar" (ASCII: [77, 97, 114])
    isMar <== eqMar.out;

    component eqApr = IsEqual();
    eqApr.in[0] <== packedMonth;
    eqApr.in[1] <== 7498081; // "Apr" (ASCII: [65, 112, 114])
    isApr <== eqApr.out;

    component eqMay = IsEqual();
    eqMay.in[0] <== packedMonth;
    eqMay.in[1] <== 7954765; // "May" (ASCII: [77, 97, 121])
    isMay <== eqMay.out;

    component eqJun = IsEqual();
    eqJun.in[0] <== packedMonth;
    eqJun.in[1] <== 7235946; // "Jun" (ASCII: [74, 117, 110])
    isJun <== eqJun.out;

    component eqJul = IsEqual();
    eqJul.in[0] <== packedMonth;
    eqJul.in[1] <== 7108378; // "Jul" (ASCII: [74, 117, 108])
    isJul <== eqJul.out;

    component eqAug = IsEqual();
    eqAug.in[0] <== packedMonth;
    eqAug.in[1] <== 6763745; // "Aug" (ASCII: [65, 117, 103])
    isAug <== eqAug.out;

    component eqSep = IsEqual();
    eqSep.in[0] <== packedMonth;
    eqSep.in[1] <== 7367780; // "Sep" (ASCII: [83, 101, 112])
    isSep <== eqSep.out;

    component eqOct = IsEqual();
    eqOct.in[0] <== packedMonth;
    eqOct.in[1] <== 7603555; // "Oct" (ASCII: [79, 99, 116])
    isOct <== eqOct.out;

    component eqNov = IsEqual();
    eqNov.in[0] <== packedMonth;
    eqNov.in[1] <== 7749494; // "Nov" (ASCII: [78, 111, 118])
    isNov <== eqNov.out;

    component eqDec = IsEqual();
    eqDec.in[0] <== packedMonth;
    eqDec.in[1] <== 651632446516324; // "Dec" (ASCII: [68, 101, 99])
    isDec <== eqDec.out;

    // Calcola il numero del mese sommando i prodotti delle corrispondenze
    monthNumber <== isJan * 1
                 + isFeb * 2
                 + isMar * 3
                 + isApr * 4
                 + isMay * 5
                 + isJun * 6
                 + isJul * 7
                 + isAug * 8
                 + isSep * 9
                 + isOct * 10
                 + isNov * 11
                 + isDec * 12;
}
