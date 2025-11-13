import { PDFDocument, rgb } from 'https://cdn.skypack.dev/pdf-lib';

document.getElementById('generatePDFButton').addEventListener('click', GeneratePDF);
async function makeGrid(pdfBytes) {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();

    // Draw grid lines every 50 points
    for (let x = 0; x < width; x += 50) {
        page.drawText(`${x}`, { x, y: 10, size: 8, color: rgb(0.8, 0, 0) });
        page.drawLine({ start: { x, y: 0 }, end: { x, y: height }, thickness: 0.2, color: rgb(0.8, 0.8, 0.8) });
    }
    for (let y = 0; y < height; y += 50) {
        page.drawText(`${y}`, { x: 2, y, size: 8, color: rgb(0.8, 0, 0) });
        page.drawLine({ start: { x: 0, y }, end: { x: width, y }, thickness: 0.2, color: rgb(0.8, 0.8, 0.8) });
    }

    const newBytes = await pdfDoc.save();
    const blob = new Blob([newBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'grid.pdf';
    link.click();
}
async function GeneratePDF() {
    const existingPdfBytes = await fetch('./form.pdf').then(res => res.arrayBuffer());
    makeGrid(existingPdfBytes)

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    let page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();
    const newPage = pdfDoc.addPage([width, height]);

    // 3. Get values from form
    const name = document.getElementById('playerName').value;
    const playerID = document.getElementById('playerID').value;
    const dob = document.getElementById('playerDOB').value;
    const deck = document.getElementById('playerDeck').value;

    // 4. Write text to PDF (x/y = coordinates from bottom-left)
    page.drawText(name, { x: 90, y: 715, size: 16, color: rgb(0, 0, 0) });
    page.drawText(playerID, { x: 280, y: 715, size: 14, color: rgb(0, 0, 0) });
    const [month, day, year] = dob.split("/");

    page.drawText(month, { x: 490, y: 715, size: 14, color: rgb(0, 0, 0) });
    page.drawText(day, { x: 520, y: 715, size: 14, color: rgb(0, 0, 0) });
    page.drawText(year, { x: 545, y: 715, size: 14, color: rgb(0, 0, 0) });

    let section = -1;

    let pokemonCount = 0;
    let trainerCount = 0;
    let energyCount = 0;

    let counts = [pokemonCount, trainerCount, energyCount];
    let paged = [false, false, false]

    let pokemonYAxis = 585;
    let trainerYAxis = 409;
    let energyYAxis = 127;

    let pagedPokemonYAxis = 725;
    let pagedTrainerYAxis = 475;
    let pagedEnergyYAxis = 175;


    let axis = [pokemonYAxis, trainerYAxis, energyYAxis];
    let pagedAxis = [pagedPokemonYAxis, pagedTrainerYAxis, pagedEnergyYAxis];

    let QuantityXAxis = 272;
    let NameXAxis = 295;
    let SetXAxis = 466;
    let CollectorNumberXAxis = 505;

    let offset = 13;

    newPage.drawText("Pokemon", { x: 0, y: 750, size: 14, color: rgb(0, 0, 0) });
    newPage.drawText("Trainers", { x: 0, y: 500, size: 14, color: rgb(0, 0, 0) });
    newPage.drawText("Energy", { x: 0, y: 200, size: 14, color: rgb(0, 0, 0) });

    let currentPage = page
    for(let line of deck.split('\n')) {
        if(line === '') continue;
        if(line.startsWith('Pokémon:')) {
            section = 0
        }
        else if(line.startsWith('Trainer:')) {
            section = 1
        }
        else if(line.startsWith('Energy:')) {
            section = 2
        }
        else {
            if(section === -1) continue;
            let lineIsPaged = 0; // used to set x axis to 0 if we are on a new page
            let currentAxis = axis[section];
            if ((section === 0 && counts[section] >= 10) || (section === 1 && counts[section] >= 18) || (section === 2 && counts[section] >= 4) || paged[section]) {
                currentPage = newPage
                if(!paged[section]) {
                    counts[section] = 0;
                }
                paged[section] = true;
                lineIsPaged = 1;
                currentAxis = pagedAxis[section];
            } else {
                currentPage = page
            }

            const parts = line.trim().split(" ");
            const quantity = parts[0];
            const collectorNumber = parts[parts.length - 1];
            const set = parts[parts.length - 2];
            const name = parts.slice(1, parts.length - 2).join(" ");


            currentPage.drawText(quantity, { x: QuantityXAxis - (QuantityXAxis * lineIsPaged), y: currentAxis - (counts[section] * offset), size: 14, color: rgb(0, 0, 0) });
            currentPage.drawText(name, { x: NameXAxis - (QuantityXAxis * lineIsPaged), y: currentAxis - (counts[section] * offset), size: 14, color: rgb(0, 0, 0) });
            if (section === 0) {
                currentPage.drawText(set, {x: SetXAxis - (QuantityXAxis * lineIsPaged), y: currentAxis - (counts[section] * offset), size: 10, color: rgb(0, 0, 0)});
                currentPage.drawText(collectorNumber, {x: CollectorNumberXAxis - (QuantityXAxis * lineIsPaged), y: currentAxis - (counts[section] * offset), size: 10, color: rgb(0, 0, 0)});
            }
            counts[section] += 1;
        }
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'filled_pdf.pdf';
    link.click();
}
