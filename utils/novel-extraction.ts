import type { NovelExtraction } from '@/types/world';

interface NovelAnalysisResult {
  success: boolean;
  data?: NovelExtraction;
  error?: string;
}

export async function extractWorldFromNovel(
  novelText: string,
  existingData?: NovelExtraction
): Promise<NovelAnalysisResult> {
  try {
    console.log('Starting novel extraction...');
    
    // Use AI to analyze the novel text
    const response = await fetch('https://toolkit.rork.com/text/llm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `You are a world-building assistant that extracts world elements from novels. 
            Analyze the provided text and extract characters, locations, items, factions, events, themes, and plot points.
            Return a JSON object with the following structure:
            {
              "characters": [{"name": "string", "role": "string", "traits": ["string"], "appearance": "string", "backstory": "string"}],
              "locations": [{"name": "string", "type": "string", "description": "string", "significance": "string"}],
              "items": [{"name": "string", "type": "string", "description": "string", "powers": "string", "history": "string"}],
              "factions": [{"name": "string", "type": "string", "ideology": "string", "goals": ["string"]}],
              "events": [{"title": "string", "description": "string", "significance": "major|moderate|minor"}],
              "themes": ["string"],
              "plotPoints": ["string"],
              "worldBuilding": ["string"]
            }
            
            Focus on extracting concrete, specific information. Avoid generic descriptions.`
          },
          {
            role: 'user',
            content: `Please analyze this novel text and extract world-building elements:\n\n${novelText.slice(0, 50000)}`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status}`);
    }

    const result = await response.json();
    let extractedData: NovelExtraction;

    try {
      extractedData = JSON.parse(result.completion);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse AI analysis results');
    }

    // Merge with existing data if provided
    if (existingData) {
      extractedData = mergeExtractionData(existingData, extractedData);
    }

    // Validate and clean the extracted data
    const cleanedData = validateAndCleanExtraction(extractedData);

    console.log('Novel extraction completed successfully');
    return {
      success: true,
      data: cleanedData
    };

  } catch (error) {
    console.error('Novel extraction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

function mergeExtractionData(existing: NovelExtraction, newData: NovelExtraction): NovelExtraction {
  return {
    characters: mergeArrayByName(existing.characters || [], newData.characters || []),
    locations: mergeArrayByName(existing.locations || [], newData.locations || []),
    items: mergeArrayByName(existing.items || [], newData.items || []),
    factions: mergeArrayByName(existing.factions || [], newData.factions || []),
    events: mergeArrayByTitle(existing.events || [], newData.events || []),
    themes: [...new Set([...(existing.themes || []), ...(newData.themes || [])])],
    plotPoints: [...new Set([...(existing.plotPoints || []), ...(newData.plotPoints || [])])],
    worldBuilding: [...new Set([...(existing.worldBuilding || []), ...(newData.worldBuilding || [])])]
  };
}

function mergeArrayByName<T extends { name?: string }>(existing: T[], newItems: T[]): T[] {
  const merged = [...existing];
  
  newItems.forEach(newItem => {
    if (!newItem.name) return;
    
    const existingIndex = merged.findIndex(item => 
      item.name && item.name.toLowerCase() === newItem.name!.toLowerCase()
    );
    
    if (existingIndex >= 0) {
      // Merge properties of existing item with new item
      merged[existingIndex] = { ...merged[existingIndex], ...newItem };
    } else {
      merged.push(newItem);
    }
  });
  
  return merged;
}

function mergeArrayByTitle<T extends { title?: string }>(existing: T[], newItems: T[]): T[] {
  const merged = [...existing];
  
  newItems.forEach(newItem => {
    if (!newItem.title) return;
    
    const existingIndex = merged.findIndex(item => 
      item.title && item.title.toLowerCase() === newItem.title!.toLowerCase()
    );
    
    if (existingIndex >= 0) {
      // Merge properties of existing item with new item
      merged[existingIndex] = { ...merged[existingIndex], ...newItem };
    } else {
      merged.push(newItem);
    }
  });
  
  return merged;
}

function validateAndCleanExtraction(data: NovelExtraction): NovelExtraction {
  return {
    characters: (data.characters || []).filter(char => char.name && char.name.trim().length > 0),
    locations: (data.locations || []).filter(loc => loc.name && loc.name.trim().length > 0),
    items: (data.items || []).filter(item => item.name && item.name.trim().length > 0),
    factions: (data.factions || []).filter(faction => faction.name && faction.name.trim().length > 0),
    events: (data.events || []).filter(event => event.title && event.title.trim().length > 0),
    themes: (data.themes || []).filter(theme => theme && theme.trim().length > 0),
    plotPoints: (data.plotPoints || []).filter(point => point && point.trim().length > 0),
    worldBuilding: (data.worldBuilding || []).filter(element => element && element.trim().length > 0)
  };
}

export async function analyzeNovelSeries(novels: { title: string; content: string }[]): Promise<NovelAnalysisResult> {
  try {
    console.log(`Analyzing series of ${novels.length} novels...`);
    
    let combinedExtraction: NovelExtraction = {
      characters: [],
      locations: [],
      items: [],
      factions: [],
      events: [],
      themes: [],
      plotPoints: [],
      worldBuilding: []
    };

    // Process each novel in the series
    for (let i = 0; i < novels.length; i++) {
      const novel = novels[i];
      console.log(`Processing novel ${i + 1}: ${novel.title}`);
      
      const result = await extractWorldFromNovel(novel.content, combinedExtraction);
      
      if (result.success && result.data) {
        combinedExtraction = result.data;
      } else {
        console.warn(`Failed to process novel ${novel.title}:`, result.error);
      }
    }

    // Perform series-level analysis
    const seriesAnalysis = await analyzeSeriesConsistency(combinedExtraction, novels);
    
    return {
      success: true,
      data: {
        ...combinedExtraction,
        worldBuilding: [...combinedExtraction.worldBuilding, ...seriesAnalysis]
      }
    };

  } catch (error) {
    console.error('Series analysis error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

async function analyzeSeriesConsistency(
  extraction: NovelExtraction, 
  novels: { title: string; content: string }[]
): Promise<string[]> {
  try {
    const response = await fetch('https://toolkit.rork.com/text/llm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `Analyze the consistency and evolution of world elements across a novel series. 
            Identify character development arcs, world expansion, recurring themes, and potential inconsistencies.
            Return an array of strings describing key observations about the series' world-building.`
          },
          {
            role: 'user',
            content: `Analyze this extracted world data from a ${novels.length}-book series:
            
            Characters: ${extraction.characters.map(c => c.name).join(', ')}
            Locations: ${extraction.locations.map(l => l.name).join(', ')}
            Themes: ${extraction.themes.join(', ')}
            
            Novel titles: ${novels.map(n => n.title).join(', ')}`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status}`);
    }

    const result = await response.json();
    
    try {
      const analysis = JSON.parse(result.completion);
      return Array.isArray(analysis) ? analysis : [result.completion];
    } catch {
      return [result.completion];
    }

  } catch (error) {
    console.error('Series consistency analysis error:', error);
    return ['Series analysis could not be completed'];
  }
}