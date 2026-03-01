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
        warmup: [
            { text: "300 Swim Choice", dist: 300 },
            { text: "400 (Swim/Kick/Swim/Pull)", dist: 400 },
            { text: "200 Swim, 200 Pull", dist: 400 },
            { text: "500 Continuous Swim", dist: 500 },
            { text: "3 x 100 Swim, 3 x 50 Kick", dist: 450 },
            { text: "200 Swim, 100 Kick, 200 Pull", dist: 500 },
            { text: "400 Swim (Breath 3/5 by 50)", dist: 400 },
            { text: "300 Pull, 200 Swim", dist: 500 },
            { text: "6 x 50 Swim (Descend 1-3)", dist: 300 }
        ],
        main: {
            1500: [
                { generate: (base) => `4 x 200 Free ${getInterval(base, 200, 15)}\n4 x 100 Free ${getInterval(base, 100, 10)}`, dist: 1200 },
                { generate: (base) => `2 x [300 Free ${getInterval(base, 300, 20)} \n     3 x 100 Free ${getInterval(base, 100, 15)}]`, dist: 1200 },
                { generate: (base) => `10 x 100 Free ${getInterval(base, 100, 15)} (Consistent Pace)`, dist: 1000 },
                { generate: (base) => `3 x 400 Free ${getInterval(base, 400, 20)}`, dist: 1200 },
                { generate: (base) => `12 x 100 Free ${getInterval(base, 100, 15)}`, dist: 1200 },
                { generate: (base) => `Pyramid: 100, 200, 300, 200, 100 Free (Rest 15s)`, dist: 900 },
                { generate: (base) => `6 x 200 Free ${getInterval(base, 200, 20)}`, dist: 1200 },
                { generate: (base) => `500 Free, 400 Free, 300 Free (Rest 30s)`, dist: 1200 },
                { generate: (base) => `2 x [4 x 150 Free ${getInterval(base, 150, 15)}]`, dist: 1200 }
            ],
            3000: [
                { generate: (base) => `5 x 400 Free ${getInterval(base, 400, 20)} (Descend 1-5)`, dist: 2000 },
                { generate: (base) => `3 x [200 Free ${getInterval(base, 200, 15)} \n     200 Pull ${getInterval(base, 200, 15)} \n     200 Free ${getInterval(base, 200, 10)}]`, dist: 1800 },
                { generate: (base) => `800 Free (Cruise)\n6 x 100 Free ${getInterval(base, 100, 10)}\n600 Pull`, dist: 2000 },
                { generate: (base) => `30 x 100 Free ${getInterval(base, 100, 15)}`, dist: 3000 },
                { generate: (base) => `15 x 200 Free ${getInterval(base, 200, 20)}`, dist: 3000 },
                { generate: (base) => `3 x 800 Free ${getInterval(base, 800, 30)}`, dist: 2400 },
                { generate: (base) => `6 x 500 Free ${getInterval(base, 500, 25)}`, dist: 3000 },
                { generate: (base) => `5 x 400 Free ${getInterval(base, 400, 20)}\n5 x 200 Free ${getInterval(base, 200, 15)}`, dist: 3000 },
                { generate: (base) => `Ladder: 200, 400, 600, 800, 600, 400 Free (Rest 20s)`, dist: 3000 }
            ],
            4000: [
                { generate: (base) => `4 x 800 Free ${getInterval(base, 800, 30)} (Negative Split)`, dist: 3200 },
                { generate: (base) => `10 x 300 Free ${getInterval(base, 300, 20)} (Hold Best Average)`, dist: 3000 },
                { generate: (base) => `1000 Free Warmup\n20 x 100 Free ${getInterval(base, 100, 15)}`, dist: 3000 },
                { generate: (base) => `40 x 100 Free ${getInterval(base, 100, 15)}`, dist: 4000 },
                { generate: (base) => `2 x 1650 Free (Rest 1:00)`, dist: 3300 },
                { generate: (base) => `5 x 800 Free ${getInterval(base, 800, 30)}`, dist: 4000 },
                { generate: (base) => `20 x 200 Free ${getInterval(base, 200, 20)}`, dist: 4000 },
                { generate: (base) => `8 x 500 Free ${getInterval(base, 500, 25)}`, dist: 4000 },
                { generate: (base) => `4 x 1000 Free (Rest 45s)`, dist: 4000 }
            ]
        }
    },
    medium: {
        warmup: [
            { text: "400 Mix (50 Swim/50 Drill)", dist: 400 },
            { text: "200 Swim, 200 Kick, 200 Pull", dist: 600 },
            { text: "3 x 150 (50 Free/50 Back/50 Free)", dist: 450 },
            { text: "400 IM Order (Drill/Swim)", dist: 400 },
            { text: "6 x 75 (Kick/Drill/Swim)", dist: 450 },
            { text: "500 (100 Free/100 Non-Free)", dist: 500 },
            { text: "300 Swim, 300 Pull, 300 Kick", dist: 900 },
            { text: "8 x 50 Choice Drill", dist: 400 },
            { text: "200 Free, 200 Back, 200 Breast (Drill)", dist: 600 }
        ],
        main: {
            1500: [
                { generate: (base) => `8 x 50 Drill/Swim ${getInterval(base, 50, 20)}\n8 x 75 IM Order (Fly/Back/Breast) ${getInterval(base, 75, 20)}`, dist: 1000 },
                { generate: (base) => `4 x 100 IM ${getInterval(base, 100, 20)}\n4 x 100 Free (Breath 3/5/7/3 by 25) ${getInterval(base, 100, 15)}`, dist: 800 },
                { generate: (base) => `12 x 75 (25 Fly/25 Free/25 Back) ${getInterval(base, 75, 20)}`, dist: 900 },
                { generate: (base) => `10 x 100 IM (Rest 20s)`, dist: 1000 },
                { generate: (base) => `6 x 200 (100 Free/100 Back) (Rest 20s)`, dist: 1200 },
                { generate: (base) => `3 x [4 x 100 (1 Fly, 1 Back, 1 Breast, 1 Free)] (Rest 20s)`, dist: 1200 },
                { generate: (base) => `20 x 50 Stroke (Drill/Swim) (Rest 15s)`, dist: 1000 },
                { generate: (base) => `5 x 200 IM (Rest 30s)`, dist: 1000 },
                { generate: (base) => `400 IM, 400 Free, 400 IM (Rest 45s)`, dist: 1200 }
            ],
            3000: [
                { generate: (base) => `6 x 200 IM ${getInterval(base, 200, 25)} (Drill/Swim by 25)\n8 x 100 Backstroke ${getInterval(base, 100, 20)}`, dist: 2000 },
                { generate: (base) => `4 x [150 Free ${getInterval(base, 150, 10)} \n     100 Stroke ${getInterval(base, 100, 20)} \n     50 Fast ${getInterval(base, 50, 10)}]`, dist: 1200 },
                { generate: (base) => `Pyramid: 100 Fly, 200 Back, 300 Breast, 400 Free, 300 Breast, 200 Back, 100 Fly (Rest 20s between)`, dist: 1600 },
                { generate: (base) => `12 x 200 IM (Rest 30s)`, dist: 2400 },
                { generate: (base) => `6 x 400 IM (Alternating Drill/Swim) (Rest 40s)`, dist: 2400 },
                { generate: (base) => `30 x 100 Stroke (10 Fly, 10 Back, 10 Breast) (Rest 20s)`, dist: 3000 },
                { generate: (base) => `5 x [200 IM, 200 Free, 200 Stroke] (Rest 30s)`, dist: 3000 },
                { generate: (base) => `1500 Mix (500 Free, 500 Pull, 500 IM) x 2`, dist: 3000 },
                { generate: (base) => `8 x 300 (50 Fly/100 Back/100 Breast/50 Free) (Rest 30s)`, dist: 2400 }
            ],
            4000: [
                { generate: (base) => `10 x 200 IM ${getInterval(base, 200, 30)} (Alternating Fast/Easy)`, dist: 2000 },
                { generate: (base) => `5 x [400 IM ${getInterval(base, 400, 40)} \n     200 Free Fast ${getInterval(base, 200, 10)}]`, dist: 3000 },
                { generate: (base) => `16 x 100 Stroke (4 Fly, 4 Back, 4 Breast, 4 Free) ${getInterval(base, 100, 25)}\n8 x 200 Pull`, dist: 3200 },
                { generate: (base) => `20 x 200 IM (Rest 30s)`, dist: 4000 },
                { generate: (base) => `4 x 800 (Alternating Free/IM) (Rest 45s)`, dist: 3200 },
                { generate: (base) => `10 x 400 (Alternating IM/Free) (Rest 40s)`, dist: 4000 },
                { generate: (base) => `30 x 100 (5 Fly, 5 Back, 5 Breast, 15 Free) (Rest 20s)`, dist: 3000 },
                { generate: (base) => `4 x [500 Free, 400 IM, 100 Easy]`, dist: 4000 },
                { generate: (base) => `16 x 200 Stroke (4 of each) (Rest 30s)`, dist: 3200 }
            ]
        }
    },
    spicy: {
        warmup: [
            { text: "600 (200 Swim/200 Kick/200 Drill)", dist: 600 },
            { text: "400 Choice + 4x25 Underwater Sprints", dist: 500 },
            { text: "10 min Vertical Kicking & Sculling", dist: 0 },
            { text: "1000 Mix (Swim/Kick/Pull/Drill/Scull)", dist: 1000 },
            { text: "800 (200 Swim, 200 IM, 200 Kick, 200 Pull)", dist: 800 },
            { text: "3 x 300 (100 Swim/100 Kick/100 IM)", dist: 900 },
            { text: "15 min Vertical Kick + Swim", dist: 0 },
            { text: "6 x 150 (50 Fly/50 Back/50 Breast)", dist: 900 },
            { text: "400 IM + 4 x 50 UW Kick", dist: 600 }
        ],
        main: {
            1500: [
                { generate: (base) => `20 x 50 Best Stroke Sprints ${getInterval(base, 50, 30)} (All Out!)`, dist: 1000 },
                { generate: (base) => `10 x 100 Hypoxic (Breath 3/5/7/9 by 25) ${getInterval(base, 100, 15)}`, dist: 1000 },
                { generate: (base) => `Broken Mile: 1650 broken into 11 x 150s ${getInterval(base, 150, 5)} (Threshold Pace)`, dist: 1650 },
                { generate: (base) => `15 x 100 Fly (Rest 20s)`, dist: 1500 },
                { generate: (base) => `3 x 400 IM (Rest 45s)`, dist: 1200 },
                { generate: (base) => `30 x 50 @ :40 (Best Stroke)`, dist: 1500 },
                { generate: (base) => `6 x 250 (50 Fly/50 Back/50 Breast/100 Free) (Rest 30s)`, dist: 1500 },
                { generate: (base) => `10 x 150 (50 Fly/50 Back/50 Breast) (Rest 20s)`, dist: 1500 },
                { generate: (base) => `1500 for time`, dist: 1500 }
            ],
            3000: [
                { generate: (base) => `30 x 100 Best Average ${getInterval(base, 100, 10)} (The 'Hundo' Set)`, dist: 3000 },
                { generate: (base) => `10 x [50 Fly Fast ${getInterval(base, 50, 10)} \n      100 Free Easy ${getInterval(base, 100, 30)} \n      50 Free Sprint ${getInterval(base, 50, 5)}]`, dist: 2000 },
                { generate: (base) => `USRPT Set: 40 x 50 Race Pace (Target: 200 Pace) @ 20s Rest. Stop if you miss target twice.`, dist: 2000 },
                { generate: (base) => `10 x 300 Fly (Rest 30s)`, dist: 3000 },
                { generate: (base) => `30 x 100 IM @ 1:30 (or fast interval)`, dist: 3000 },
                { generate: (base) => `3 x 1000 (IM/Free/Pull) (Rest 1:00)`, dist: 3000 },
                { generate: (base) => `12 x 250 (IM order) (Rest 30s)`, dist: 3000 },
                { generate: (base) => `60 x 50 (20 Fly, 20 Back, 20 Breast) @ :50`, dist: 3000 },
                { generate: (base) => `100 x 25 Underwater Kick @ :40`, dist: 2500 }
            ],
            4000: [
                { generate: (base) => `The 'Animal' Set: \n4 x 100 Fly ${getInterval(base, 100, 20)}\n4 x 200 Back ${getInterval(base, 200, 20)}\n4 x 300 Breast ${getInterval(base, 300, 20)}\n4 x 400 Free ${getInterval(base, 400, 15)}`, dist: 4000 },
                { generate: (base) => `100 x 25 @ :30 (Every 4th one underwater)`, dist: 2500 },
                { generate: (base) => `10 x 400 IM ${getInterval(base, 400, 45)} (Descend 1-5, 6-10)`, dist: 4000 },
                { generate: (base) => `40 x 100 IM (Rest 15s)`, dist: 4000 },
                { generate: (base) => `10 x 400 IM Fast (Rest 1:00)`, dist: 4000 },
                { generate: (base) => `20 x 200 Fly (Rest 30s)`, dist: 4000 },
                { generate: (base) => `4 x 1000 (IM/Free/Pull/Kick) (Rest 1:00)`, dist: 4000 },
                { generate: (base) => `80 x 50 Best Stroke @ :50`, dist: 4000 },
                { generate: (base) => `160 x 25 @ :30`, dist: 4000 }
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
    const selectedWarmupObj = warmups[Math.floor(Math.random() * warmups.length)];
    
    // 2. Select Main Set
    const mainSets = workoutLibrary[selectedIntensity].main[selectedDistance];
    const selectedMainSetObj = mainSets[Math.floor(Math.random() * mainSets.length)];
    
    const selectedWarmupText = selectedWarmupObj.text;
    const selectedMainSetText = selectedMainSetObj.generate(baseSeconds);

    // 3. Calculate Cool Down based on remaining yardage
    let coolDownText = "200 Easy Choice";
    let coolDownDist = 200;
    if (selectedDistance == 4000) { coolDownText = "400 Easy Choice"; coolDownDist = 400; }
    if (selectedDistance == 1500) { coolDownText = "100 Easy Choice"; coolDownDist = 100; }

    // 4. Calculate Total Distance
    const totalDistance = selectedWarmupObj.dist + selectedMainSetObj.dist + coolDownDist;

    // Construct the display text
    const date = new Date().toLocaleDateString();
    const title = `${selectedIntensity.toUpperCase()} - ${selectedDistance} Yards`;
    
    currentWorkoutText = `SWIM WORKOUT - ${date}\n`;
    currentWorkoutText += `Type: ${title}\n`;
    if (baseSeconds) currentWorkoutText += `Base Pace: ${timeInput}/100\n`;
    currentWorkoutText += `----------------------------------------\n\n`;
    
    currentWorkoutText += `WARM UP:\n${selectedWarmupText}\n\n`;
    currentWorkoutText += `MAIN SET:\n${selectedMainSetText}\n\n`;
    currentWorkoutText += `COOL DOWN:\n${coolDownText}\n\n`;
    currentWorkoutText += `TOTAL DISTANCE: ${totalDistance} Yards`;

    // Update UI
    document.getElementById('workout-content').innerText = currentWorkoutText;
    document.getElementById('workout-stats').innerHTML = `<strong>Total Distance:</strong> ${totalDistance} Yards`;
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

// Allow pressing "Enter" in the time input to generate the workout
document.getElementById('base-time').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        generateWorkout();
    }
});