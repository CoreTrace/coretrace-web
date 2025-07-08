
function extractSarifBlocks(output) {
    // This regex finds top-level JSON objects (not perfect, but works for SARIF blocks)
    const regex = /{[\s\S]*?"runs":\s*\[[\s\S]*?\][\s\S]*?}/g;
    return output.match(regex) || [];
}

function parseSarifResults(sarifJson) {
    const results = [];
    const sarif = JSON.parse(sarifJson);
    if (!sarif.runs) return results;
    for (const run of sarif.runs) {
        const tool = run.tool?.driver?.name || "unknown";
        for (const result of run.results || []) {
            const message = result.message?.text || "";
            const locations = (result.locations || []).map(loc => {
                const phys = loc.physicalLocation || {};
                const region = phys.region || {};
                return {
                    file: phys.artifactLocation?.uri,
                    startLine: region.startLine,
                    startColumn: region.startColumn,
                    endColumn: region.endColumn,
                    snippet: region.snippet?.text
                };
            });
            results.push({
                tool,
                message,
                locations
            });
        }
    }
    return results;
}

function parseToolOutputs(outputText) {
    const toolResults = [];

    // Match all JSON blocks (assuming each JSON starts with { and ends with })
    const jsonBlocks = [...outputText.matchAll(/\{[\s\S]*?\n\}/g)];

    for (const match of jsonBlocks) {
        try {
            const json = JSON.parse(match[0]);
            if (!json.runs || !Array.isArray(json.runs)) continue;

            for (const run of json.runs) {
                const toolName = run.tool?.driver?.name || 'Unknown Tool';
                const results = [];

                for (const result of run.results || []) {
                    const message = result.message?.text || '';
                    const locations = result.locations?.map(loc => {
                        const phys = loc.physicalLocation || {};
                        const region = phys.region || {};
                        return {
                            file: phys.artifactLocation?.uri || '',
                            startLine: region.startLine || null,
                            startColumn: region.startColumn || null,
                            endColumn: region.endColumn || null,
                            snippet: region.snippet?.text || ''
                        };
                    }) || [];

                    results.push({ message, locations });
                }

                toolResults.push({
                    tool: toolName,
                    results
                });
            }
        } catch (e) {
            // Invalid JSON block, skip
            continue;
        }
    }

    return toolResults;
}


module.exports = {
    extractSarifBlocks,
    parseSarifResults,
    parseToolOutputs
};
