// progressMap.ts

export function getProgress(currentScreen: string, nextScreen: string): number {
    const map: Record<string, Record<string, number>> = {
        genderView: {
            default: 0,
        },
        bodyImage: {
            default: 5,
        },
        hpatientView: {
            conditionView: 10,
            mainSymptom: 10,
            painView: 10,
            default: 8,
        },
        painView: {
            mainSymptom: 15,
            conditionView: 15,
            default: 13,
        },
        mainSymptom: {
            conditionView: 20,
            default: 18,
        },
        conditionView: {
            chronicalView: 25,
            default: 23,
        },
        chronicalView: {
            operationView: 30,
            chronicalSince: 30,
            default: 28,
        },
        chronicalSince: {
            operationView: 35,
            default: 33,
        },
        operationView: {
            badHabbits: 40,
            default: 38,
        },
        badHabbits: {
            drugView: 45,
            default: 43,
        },
        drugView: {
            pharmacologyView: 50,
            default: 48,
        },
        pharmacologyView: {
            MedicationDetailsSection: 55,
            default: 53,
        },
        MedicationDetailsSection: {
            allergyFoodView: 60,
            default: 58,
        },
        allergyFoodView: {
            aleergyMedicationView: 65,
            default: 63,
        },
        aleergyMedicationView: {
            socialView: 70,
            default: 68,
        },
        socialView: {
            referralUploadView: 75,
            default: 73,
        },
        referralUploadView: {
            gynecologyView: 80,
            default: 78,
        },
        gynecologyView: {
            thankYouView: 100,
            default: 90,
        },
        thankYouView: {
            default: 100,
        }
    };

    const screenMap = map[currentScreen];
    if (screenMap) {
        return screenMap[nextScreen] ?? screenMap.default ?? 0;
    }

    return 0;
}
