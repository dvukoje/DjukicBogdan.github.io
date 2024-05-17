let maxCombination = 0;
let countIterations = 0;
let timeLimit = 1000;
async function generateMatches(players, matches, currentMatch, courts) {
  // console.log(currentMatch);
  // console.log(currentMatch[0]);
  // console.log(players, matches, currentMatch, courts);
  if (currentMatch.length > 0) {
    // console.log(currentMatch[0],currentMatch[1]);
    // console.log(maxCombination);
    // console.log(currentMatch.length);
  }
  if (currentMatch.length === players.length || currentMatch.length > maxCombination) {
    if (maxCombination < currentMatch.length) {
      maxCombination = currentMatch.length;
    }
    // All players processed, add the current match combination
    matches.push([...currentMatch]);
    return;
  }
  const playerIndex = currentMatch.length;
  // console.log(playerIndex);
  const player1 = players[playerIndex];
  let checkDouble = false;
  for (let player2 of player1.POTENCIJALNI_PROTIVNICI) {
    // console.log(player1);
    player2 = players.find((p) => p.PLAYER_ID === player2);
    // console.log(player2);
    if (!player2) {
      return;
    }
    for (let i = 0; i < currentMatch.length; i++) {
      // console.log(currentMatch[i]);
      // console.log(player1,player2);
      if (currentMatch[i].player1ID === player2.PLAYER_ID) {
        checkDouble = true;
        // console.log(currentMatch[i]);
        return;
      }
    }
    if (checkDouble) {
      // return;
    }
    // console.log(currentMatch[0]);
    // console.log(player1, player2);
    if (!checkDouble && player1.PREOSTALO_MECEVA > 0 && player2.PREOSTALO_MECEVA > 0 && player1.ZELI_IGRATI_MECEVA > 0 && player2.ZELI_IGRATI_MECEVA > 0) {
      //   const commonSlots = player1.TERMINI_IGRACA.filter((slot) => player2.TERMINI_IGRACA.includes(slot));
      let termini = [];
      for (let i = 0; i < player1.TERMINI_IGRACA.length; i++) {
        let termin = player2.TERMINI_IGRACA.find((s) => player1.TERMINI_IGRACA[i].sat == s.sat && player1.TERMINI_IGRACA[i].dan == s.dan);
        if (termin) {
          termini.push(termin);
        }
      }
      const commonSlots = [...termini];
      for (const slot of commonSlots) {
        // if (courts[slot].length > 0) {
        if (courts.find((c) => c.dan == slot.dan && c.sat == slot.sat)) {
          // Create a match
          const allocatedCourt = allocateCourt(slot);
          if (allocatedCourt !== null) {
            currentMatch.push({
              player1ID: player1.PLAYER_ID,
              player2ID: player2.PLAYER_ID,
              //   timeSlot: slot,
              // court: allocatedCourt,
              dayPlayed: allocatedCourt.dan,
              hourPlayed: allocatedCourt.sat,
              courtID: allocatedCourt.teren,
            });

            player1.PREOSTALO_MECEVA--;
            player2.PREOSTALO_MECEVA--;
            player1.ZELI_IGRATI_MECEVA--;
            player2.ZELI_IGRATI_MECEVA--;
            if (countIterations < timeLimit) {
              // maxCombination = 0;
              await generateMatches(players, matches, currentMatch, courts);
              countIterations++;
              // console.log(countIterations);
              // console.log(matches.length);
            } else {
              return matches;
            }
            // Backtrack: restore state
            player1.PREOSTALO_MECEVA++;
            player2.PREOSTALO_MECEVA++;
            player1.ZELI_IGRATI_MECEVA++;
            player2.ZELI_IGRATI_MECEVA++;
            currentMatch.pop();
            courts.push(allocatedCourt);
          }
        }
      }
    }
  }
}

// Example usage:
const matches = [];
const allMatches = [];
const currentMatch = [];
const allTimeSlots = [
  /* DAY-HOUR combinations */
]; // e.g., 1-10 represents Monday 10:00 AM

// Sample player objects (replace with your actual data)
let players = [];

// Initialize courts with available court IDs per time slot
let courts = {};

// Function to allocate a court based on availability
function allocateCourt(timeSlot) {
  //   if (courts[timeSlot].length > 0) {
  let t = courts.find((c) => c.dan == timeSlot.dan && c.sat == timeSlot.sat);
  if (t) {
    return courts.shift(); // Allocate the first available court
  }
  return null; // No available court
}

// Start the backtracking process

async function prioritizeMatches(data, prioritizedMatches) {
  // console.log(prioritizedMatches);
  bestCombination = null;
  tempBestCombination = 0;
  let totalScore = 0;
  let priorities = data.PRIORITETI.sort(function (a, b) {
    return a.id - b.id;
  });
  for (const priority of priorities) {
    switch (priority.id) {
      case "10":
        totalScore = 0;
        bestCombination = null;
        if (!prioritizedMatches) {
          return;
        }
        for (let i = 0; i < prioritizedMatches.length; i++) {
          let brojIgracaKojimaJeNadjenMec = [...new Set(prioritizedMatches[i].map((item) => item.player1ID))].length;
          let brojProsledjenihIgraca = data.IGRACI.length;
          let Min1MecScore = 0;
          if (brojIgracaKojimaJeNadjenMec > 0 && brojProsledjenihIgraca > 0) {
            Min1MecScore = brojIgracaKojimaJeNadjenMec / brojProsledjenihIgraca;
          }
          priority.score = Min1MecScore * priority.priority;
          // console.log(priority.priority);
        }
        if (tempBestCombination < totalScore) {
          tempBestCombination = totalScore;
          bestCombination = prioritizedMatches[i];
        }
        totalScore = 0;
        break;
      case "20":
        totalScore = 0;
        bestCombination = null;
        for (let i = 0; i < prioritizedMatches.length; i++) {
          let brojPronadjenihMeceva = prioritizedMatches[i].length;
          let klubPonudioTermine = data.TERMINI_KLUBA.length;
          let MaxMecScore = 0;
          if (brojPronadjenihMeceva > 0 && klubPonudioTermine > 0) {
            MaxMecScore = brojPronadjenihMeceva / klubPonudioTermine;
          }
          priority.score = MaxMecScore * priority.priority;
          //   console.log(priority);
        }
        if (tempBestCombination < totalScore) {
          tempBestCombination = totalScore;
          bestCombination = prioritizedMatches[i];
        }
        totalScore = 0;
        break;
      case "30":
        totalScore = 0;
        bestCombination = null;
        for (let i = 0; i < prioritizedMatches.length; i++) {
          let brojPronadjenihJutarnjihMeceva = 0;
          let klubPonudioJutarnjeTermine = 0;
          let JutarnjiTerminiScore = 0;

          for (let j = 0; j < prioritizedMatches[i].length; j++) {
            if (prioritizedMatches[i][j].hourPlayed < 12) {
              brojPronadjenihJutarnjihMeceva += Number(prioritizedMatches[i][j].hourPlayed);
            }
          }
          for (let i = 0; i < data.TERMINI_KLUBA.length; i++) {
            if (Number(data.TERMINI_KLUBA[i].sat) < 12) {
              klubPonudioJutarnjeTermine += Number(data.TERMINI_KLUBA[i].sat);
            }
          }
          if (brojPronadjenihJutarnjihMeceva > 0 && klubPonudioJutarnjeTermine > 0) {
            JutarnjiTerminiScore = brojPronadjenihJutarnjihMeceva / klubPonudioJutarnjeTermine;
          }
          priority.score = JutarnjiTerminiScore * priority.priority;
          //   console.log(priority);
        }
        if (tempBestCombination < totalScore) {
          tempBestCombination = totalScore;
          bestCombination = prioritizedMatches[i];
        }
        totalScore = 0;
        break;
      case "40":
        totalScore = 0;
        bestCombination = null;
        for (let i = 0; i < prioritizedMatches.length; i++) {
          let ukupanBrojProstalihMecevaZaSveIgraceIzKombinacije = 0;
          let ukupanBrojProstalihMecevaZaSveIgraceIzJsona = 0;
          let BrojPreostalihMecevaScore = 0;

          let ListaSvihIgracaUKombinaciji = [];
          for (let j = 0; j < prioritizedMatches[i].length; j++) {
            ListaSvihIgracaUKombinaciji.push(prioritizedMatches[i][j].player1ID);
            ListaSvihIgracaUKombinaciji.push(prioritizedMatches[i][j].player2ID);
          }
          let unikatnaListaSvihIgracaUKombinaciji = [];
          for (let i = 0; i < ListaSvihIgracaUKombinaciji.length; i++) {
            let count = 0;
            for (let j = 0; j < unikatnaListaSvihIgracaUKombinaciji.length; j++) {
              if (unikatnaListaSvihIgracaUKombinaciji[j] && ListaSvihIgracaUKombinaciji[i] == unikatnaListaSvihIgracaUKombinaciji[j].igrac) {
                count++;
              }
            }
            if (count == 0) {
              unikatnaListaSvihIgracaUKombinaciji.push({ igrac: ListaSvihIgracaUKombinaciji[i], ponavljanje: 1 });
            } else {
              let p = unikatnaListaSvihIgracaUKombinaciji.find((igrac) => igrac.igrac == ListaSvihIgracaUKombinaciji[i]);
              p.ponavljanje += count;
            }
            count = 0;
          }
          for (let i = 0; i < unikatnaListaSvihIgracaUKombinaciji.length; i++) {
            let igrac = data.IGRACI.find((igr) => igr.PLAYER_ID == unikatnaListaSvihIgracaUKombinaciji[i].igrac);
            ukupanBrojProstalihMecevaZaSveIgraceIzKombinacije += Number(igrac.PREOSTALO_MECEVA);
          }
          for (let i = 0; i < data.IGRACI.length; i++) {
            ukupanBrojProstalihMecevaZaSveIgraceIzJsona += Number(data.IGRACI[i].PREOSTALO_MECEVA);
          }
          BrojPreostalihMecevaScore = ukupanBrojProstalihMecevaZaSveIgraceIzKombinacije / ukupanBrojProstalihMecevaZaSveIgraceIzJsona;
          priority.score = BrojPreostalihMecevaScore * priority.priority;
          //   console.log(priority);
        }
        if (tempBestCombination < totalScore) {
          tempBestCombination = totalScore;
          bestCombination = prioritizedMatches[i];
        }
        totalScore = 0;
        break;
      case "50":
        totalScore = 0;
        bestCombination = null;
        for (let i = 0; i < prioritizedMatches.length; i++) {
          let ukupanBrojPrijavljenihTerminaZaSveIgraceIzKombinacije = 0;
          let ukupanBrojPrijavljenihTerminaZaSveIgraceIzJsona = 0;
          let BrojPrijavljenihTerminaScore = 0;

          let ListaSvihIgracaUKombinacijiPrijavljenihTermina = [];
          for (let j = 0; j < prioritizedMatches[i].length; j++) {
            ListaSvihIgracaUKombinacijiPrijavljenihTermina.push(prioritizedMatches[i][j].player1ID);
            ListaSvihIgracaUKombinacijiPrijavljenihTermina.push(prioritizedMatches[i][j].player2ID);
          }
          let unikatnaListaSvihIgracaUKombinacijiPrijavljenihTermina = [];
          for (let i = 0; i < ListaSvihIgracaUKombinacijiPrijavljenihTermina.length; i++) {
            let count = 0;
            for (let j = 0; j < unikatnaListaSvihIgracaUKombinacijiPrijavljenihTermina.length; j++) {
              if (unikatnaListaSvihIgracaUKombinacijiPrijavljenihTermina[j] && ListaSvihIgracaUKombinacijiPrijavljenihTermina[i] == unikatnaListaSvihIgracaUKombinacijiPrijavljenihTermina[j].igrac) {
                count++;
              }
            }
            if (count == 0) {
              unikatnaListaSvihIgracaUKombinacijiPrijavljenihTermina.push({ igrac: ListaSvihIgracaUKombinacijiPrijavljenihTermina[i], ponavljanje: 1 });
            } else {
              let p = unikatnaListaSvihIgracaUKombinacijiPrijavljenihTermina.find((igrac) => igrac.igrac == ListaSvihIgracaUKombinacijiPrijavljenihTermina[i]);
              p.ponavljanje += count;
            }
            count = 0;
          }
          for (let i = 0; i < unikatnaListaSvihIgracaUKombinacijiPrijavljenihTermina.length; i++) {
            let igrac = data.IGRACI.find((igr) => igr.PLAYER_ID == unikatnaListaSvihIgracaUKombinacijiPrijavljenihTermina[i].igrac);
            ukupanBrojPrijavljenihTerminaZaSveIgraceIzKombinacije += Number(igrac.PREOSTALO_MECEVA);
          }
          for (let i = 0; i < data.IGRACI.length; i++) {
            ukupanBrojPrijavljenihTerminaZaSveIgraceIzJsona += Number(data.IGRACI[i].PREOSTALO_MECEVA);
          }
          if (ukupanBrojPrijavljenihTerminaZaSveIgraceIzKombinacije > 0 && ukupanBrojPrijavljenihTerminaZaSveIgraceIzJsona > 0) {
          }
          BrojPrijavljenihTerminaScore = ukupanBrojPrijavljenihTerminaZaSveIgraceIzKombinacije / ukupanBrojPrijavljenihTerminaZaSveIgraceIzJsona;
          priority.score = BrojPrijavljenihTerminaScore * priority.priority;
          // console.log(priority);
          for (let i = 0; i < data.PRIORITETI.length; i++) {
            totalScore += data.PRIORITETI[i].score;
          }
          //   console.log("totalScore: ", totalScore);
          if (tempBestCombination < totalScore) {
            tempBestCombination = totalScore;
            bestCombination = prioritizedMatches[i];
          }
          totalScore = 0;
        }
        break;
      default:
        break;
    }
  }
  //   console.log("bestCombination", bestCombination);
  //   console.log("tempBestCombination", tempBestCombination);
  // totalScore = P1score * P1weight  + P2score * P2weight ..
  //   console.log("formula: P1-score * P1-weight + P2-score * P2-weight ...");
  //   console.log("weight === json.PRIORITETI(key.priority)");
  //   prioritizedMatches.push({"totalScore":totalScore});
  //   console.log(await prioritizedMatches);
  return await Array.from(bestCombination); // Pretvaramo Set nazad u niz pre vraćanja rezultata
}

async function setData(data) {
  if (!data) {
    return "data is null";
  } else if (!data || typeof data !== "object") {
    return "Invalid JSON data format: Data is not a valid JSON object.";
  } else if (!data.IGRACI) {
    return "IGRACI in data is null";
  } else if (!data.TERMINI_KLUBA) {
    return "TERMINI_KLUBA in data is null";
  } else if (!data.PRIORITETI) {
    return "PRIORITETI in data is null";
  }
  if (data.TIMEOUT && parseInt(data.TIMEOUT) > 1) {
    timeLimit = parseInt(data.TIMEOUT) * 1000;
  } else {
    timeLimit = 1000;
  }
  for (let i = 0; i < data.IGRACI.length; i++) {
    data.IGRACI[i].ZELI_IGRATI_MECEVA = parseInt(data.IGRACI[i].ZELI_IGRATI_MECEVA);
    data.IGRACI[i].PREOSTALO_MECEVA = parseInt(data.IGRACI[i].PREOSTALO_MECEVA);
    for (let j = 0; j < data.IGRACI[i].TERMINI_IGRACA.length; j++) {
      data.IGRACI[i].TERMINI_IGRACA[j].sat = parseInt(data.IGRACI[i].TERMINI_IGRACA[j].sat);
      data.IGRACI[i].TERMINI_IGRACA[j].dan = parseInt(data.IGRACI[i].TERMINI_IGRACA[j].dan);
    }
  }
  for (let i = 0; i < data.TERMINI_KLUBA.length; i++) {
    data.TERMINI_KLUBA[i].dan = parseInt(data.TERMINI_KLUBA[i].dan);
    data.TERMINI_KLUBA[i].sat = parseInt(data.TERMINI_KLUBA[i].sat);
  }
  players = data.IGRACI;
  courts = data.TERMINI_KLUBA;
  // console.log("data", data);
  let result = await generateMatches(players, matches, currentMatch, courts);
  // console.log("result", result);
  if (!result) {
    result = await matches;
  }
  // console.log("result", result);
  let bestCombination = await prioritizeMatches(data, result);
  // console.log("bestCombination", bestCombination);
  if (!bestCombination) {
    bestCombination = "no data";
  }
  return bestCombination;
}

// fetch("./datagenerisani6.json")
//   .then((response) => response.json())
//   .then((json) => setData(json));

window.function = async function (text) {
  let json = JSON.parse(text.value);

  // Provera da li je JSON objekat validan
  if (!json || typeof json !== "object") {
    return "Invalid JSON data format: Data is not a valid JSON object.";
  }

  // Provera ostalih neophodnih delova JSON-a
  if (!json.IGRACI || !Array.isArray(json.IGRACI) || !json.TERMINI_KLUBA || !Array.isArray(json.TERMINI_KLUBA) || !json.PRIORITETI || !Array.isArray(json.PRIORITETI)) {
    return "Invalid JSON data format: Missing player information, club slots, or priorities.";
  }

  let result = await setData(json);
  let senddata = await JSON.stringify(result);
  return await senddata.toString();
};
