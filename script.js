let selectedIntensity = null;
let selectedDistance = null;
let currentWorkoutText = "";

function selectOption(type, value) {
    if (type === 'intensity') {
        selectedIntensity = value;
        document.querySelectorAll('#intensity-group .btn').forEach(btn => btn.classList.remove('selected'));
        document.querySelector(`button[data-value="${value}"]`).classList.add('selected');
    } else if (type === 'distance') {
        selectedDistance = value;
        document.querySelectorAll('#distance-group .btn').forEach(btn => btn.classList.remove('selected'));
        document.querySelector(`button[data-value="${value}"]`).classList.add('selected');
    }
}

function parseTime(timeStr) {
    if (!timeStr) return null;
    const parts = timeStr.split(':');
    if (parts.length !== 2) return null;
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function getInterval(baseSeconds, distance, intensityModifier) {
    if (!baseSeconds) return "Rest: 15s";
    
    // Calculate estimated time for this distance based on 100 pace
    const multiplier = distance / 100;
    let totalSeconds = baseSeconds * multiplier;
    
    // Add buffer based on intensity (Easy = +15s/100, Fast = +5s/100)
    totalSeconds += (intensityModifier * multiplier);
    
    // Round up to nearest 5 seconds for a clean interval
    totalSeconds = Math.ceil(totalSeconds / 5) * 5;
    
    return `@ ${formatTime(totalSeconds)}`;
}

const workoutLibrary = {
    mild: {
        warmup: ["300 Swim Choice", "400 (Swim/Kick/Swim/Pull)", "200 Swim, 200 Pull"],
        main: {
            1500: [
                (base) => `4 x 200 Free ${getInterval(base, 200, 15)}\n4 x 100 Free ${getInterval(base, 100, 10)}`,
                (base) => `2 x [300 Free ${getInterval(base, 300, 20)} \n     3 x 100 Free ${getInterval(base, 100, 15)}]`,
                (base) => `10 x 100 Free ${getInterval(base, 100, 15)} (Consistent Pace)`
            ],
            3000: [
                (base) => `5 x 400 Free ${getInterval(base, 400, 20)} (Descend 1-5)`,
                (base) => `3 x [200 Free ${getInterval(base, 200, 15)} \n     200 Pull ${getInterval(base, 200, 15)} \n     200 Free ${getInterval(base, 200, 10)}]`,
                (base) => `800 Free (Cruise)\n6 x 100 Free ${getInterval(base, 100, 10)}\n600 Pull`
            ],
            4000: [
                (base) => `4 x 800 Free ${getInterval(base, 800, 30)} (Negative Split)`,
                (base) => `10 x 300 Free ${getInterval(base, 300, 20)} (Hold Best Average)`,
                (base) => `1000 Free Warmup\n20 x 100 Free ${getInterval(base, 100, 15)}`
            ]
        }
    },
    medium: {
        warmup: ["400 Mix (50 Swim/50 Drill)", "200 Swim, 200 Kick, 200 Pull", "3 x 150 (50 Free/50 Back/50 Free)"],
        main: {
            1500: [
                (base) => `8 x 50 Drill/Swim ${getInterval(base, 50, 20)}\n8 x 75 IM Order (Fly/Back/Breast) ${getInterval(base, 75, 20)}`,
                (base) => `4 x 100 IM ${getInterval(base, 100, 20)}\n4 x 100 Free (Breath 3/5/7/3 by 25) ${getInterval(base, 100, 15)}`,
                (base) => `12 x 75 (25 Fly/25 Free/25 Back) ${getInterval(base, 75, 20)}`
            ],
            3000: [
                (base) => `6 x 200 IM ${getInterval(base, 200, 25)} (Drill/Swim by 25)\n8 x 100 Backstroke ${getInterval(base, 100, 20)}`,
                (base) => `4 x [150 Free ${getInterval(base, 150, 10)} \n     100 Stroke ${getInterval(base, 100, 20)} \n     50 Fast ${getInterval(base, 50, 10)}]`,
                (base) => `Pyramid: 100 Fly, 200 Back, 300 Breast, 400 Free, 300 Breast, 200 Back, 100 Fly (Rest 20s between)`
            ],
            4000: [
                (base) => `10 x 200 IM ${getInterval(base, 200, 30)} (Alternating Fast/Easy)`,
                (base) => `5 x [400 IM ${getInterval(base, 400, 40)} \n     200 Free Fast ${getInterval(base, 200, 10)}]`,
                (base) => `16 x 100 Stroke (4 Fly, 4 Back, 4 Breast, 4 Free) ${getInterval(base, 100, 25)}\n8 x 200 Pull`
            ]
        }
    },
    spicy: {
        warmup: ["600 (200 Swim/200 Kick/200 Drill)", "400 Choice + 4x25 Underwater Sprints", "10 min Vertical Kicking & Sculling"],
        main: {
            1500: [
                (base) => `20 x 50 Best Stroke Sprints ${getInterval(base, 50, 30)} (All Out!)`,
                (base) => `10 x 100 Hypoxic (Breath 3/5/7/9 by 25) ${getInterval(base, 100, 15)}`,
                (base) => `Broken Mile: 1650 broken into 11 x 150s ${getInterval(base, 150, 5)} (Threshold Pace)`
            ],
            3000: [
                (base) => `30 x 100 Best Average ${getInterval(base, 100, 10)} (The 'Hundo' Set)`,
                (base) => `10 x [50 Fly Fast ${getInterval(base, 50, 10)} \n      100 Free Easy ${getInterval(base, 100, 30)} \n      50 Free Sprint ${getInterval(base, 50, 5)}]`,
                (base) => `USRPT Set: 40 x 50 Race Pace (Target: 200 Pace) @ 20s Rest. Stop if you miss target twice.`
            ],
            4000: [
                (base) => `The 'Animal' Set: \n4 x 100 Fly ${getInterval(base, 100, 20)}\n4 x 200 Back ${getInterval(base, 200, 20)}\n4 x 300 Breast ${getInterval(base, 300, 20)}\n4 x 400 Free ${getInterval(base, 400, 15)}`,
                (base) => `100 x 25 @ :30 (Every 4th one underwater)`,
                (base) => `10 x 400 IM ${getInterval(base, 400, 45)} (Descend 1-5, 6-10)`
            ]
        }
    }
};

function generateWorkout() {
    if (!selectedIntensity || !selectedDistance) {
        alert("Please select both a Spice Level and a Distance!");
        return;
    }

    const timeInput = document.getElementById('base-time').value;
    const baseSeconds = parseTime(timeInput);
    
    if (timeInput && !baseSeconds) {
        alert("Please enter time in MM:SS format (e.g., 1:30)");
        return;
    }

    // 1. Select Warmup
    const warmups = workoutLibrary[selectedIntensity].warmup;
    const selectedWarmup = warmups[Math.floor(Math.random() * warmups.length)];
    
    // 2. Select Main Set
    const mainSets = workoutLibrary[selectedIntensity].main[selectedDistance];
    // If we have a function (dynamic interval), call it, otherwise use string
    const rawMainSet = mainSets[Math.floor(Math.random() * mainSets.length)];
    const selectedMainSet = typeof rawMainSet === 'function' ? rawMainSet(baseSeconds) : rawMainSet;

    // 3. Calculate Cool Down based on remaining yardage
    // Rough estimation: Warmup is ~400-600, Main is bulk.
    // We will just append a standard cool down.
    let coolDown = "200 Easy Choice";
    if (selectedDistance == 4000) coolDown = "400 Easy Choice";
    if (selectedDistance == 1500) coolDown = "100 Easy Choice";

    // Construct the display text
    const date = new Date().toLocaleDateString();
    const title = `${selectedIntensity.toUpperCase()} - ${selectedDistance} Yards`;
    
    currentWorkoutText = `SWIM WORKOUT - ${date}\n`;
    currentWorkoutText += `Type: ${title}\n`;
    if (baseSeconds) currentWorkoutText += `Base Pace: ${timeInput}/100\n`;
    currentWorkoutText += `----------------------------------------\n\n`;
    
    currentWorkoutText += `WARM UP:\n${selectedWarmup}\n\n`;
    currentWorkoutText += `MAIN SET:\n${selectedMainSet}\n\n`;
    currentWorkoutText += `COOL DOWN:\n${coolDown}`;

    // Update UI
    document.getElementById('workout-content').innerText = currentWorkoutText;
    document.getElementById('workout-display').classList.remove('hidden');
    
    // Scroll to result
    document.getElementById('workout-display').scrollIntoView({ behavior: 'smooth' });
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(0, 119, 190);
    doc.text("Swim Workout", 20, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    const lines = currentWorkoutText.split('\n');
    let y = 40;
    
    lines.forEach(line => {
        if (line.includes("WARM UP") || line.includes("MAIN SET") || line.includes("COOL DOWN")) {
            doc.setFont("helvetica", "bold");
            y += 5;
        } else {
            doc.setFont("helvetica", "normal");
        }
        
        // Handle long lines
        const splitLines = doc.splitTextToSize(line, 170);
        doc.text(splitLines, 20, y);
        y += (7 * splitLines.length);
    });
    
    doc.save('swim-workout.pdf');
}