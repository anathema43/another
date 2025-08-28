// Markdown Data Layer - Fetches and parses strategic documents
export class MarkdownDataLayer {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async fetchMarkdownFile(filePath) {
    const cacheKey = filePath;
    const cached = this.cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.content;
    }

    try {
      const response = await fetch(`/${filePath}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${filePath}: ${response.status}`);
      }
      const content = await response.text();
      
      this.cache.set(cacheKey, {
        content,
        timestamp: Date.now()
      });
      
      return content;
    } catch (error) {
      console.error(`Error fetching ${filePath}:`, error);
      return null;
    }
  }

  parseCompletedMilestones(content) {
    if (!content) return [];

    const milestones = [];
    const sections = content.split('####');
    
    sections.forEach(section => {
      if (section.includes('**🔒') || section.includes('**🔍') || 
          section.includes('**📸') || section.includes('**🛍️') || 
          section.includes('**🎨') || section.includes('**🧪') || 
          section.includes('**👨‍💼')) {
        
        const lines = section.split('\n').filter(line => line.trim());
        if (lines.length > 0) {
          const titleLine = lines[0];
          const title = titleLine.replace(/\*\*/g, '').trim();
          
          const features = [];
          let description = '';
          
          lines.forEach(line => {
            if (line.startsWith('- ')) {
              features.push(line.substring(2).trim());
            } else if (line.trim() && !line.includes('**') && !line.includes('####')) {
              description += line.trim() + ' ';
            }
          });

          if (title) {
            milestones.push({
              id: milestones.length + 1,
              title: title,
              description: description.trim(),
              features: features.slice(0, 4), // Limit to 4 features for display
              category: this.extractCategory(title),
              status: 'complete',
              completedDate: 'Current'
            });
          }
        }
      }
    });

    return milestones;
  }

  parseImmediatePriorities(content) {
    if (!content) return [];

    const priorities = [];
    
    // Look for "Next Actions" or "Immediate Priorities" section
    const nextActionsMatch = content.match(/## 📅 Next Actions.*?(?=##|$)/s);
    if (nextActionsMatch) {
      const section = nextActionsMatch[0];
      const lines = section.split('\n');
      
      let currentPriority = null;
      
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.match(/^\d+\./)) {
          // Extract priority item
          const match = trimmed.match(/^\d+\.\s*(.+)/);
          if (match) {
            const title = match[1].replace(/✅|⬜/g, '').trim();
            const isCompleted = trimmed.includes('✅');
            const timeline = this.extractTimeline(trimmed);
            
            priorities.push({
              id: priorities.length + 1,
              title: title,
              priority: this.determinePriority(title),
              timeline: timeline || 'TBD',
              status: isCompleted ? 'complete' : 'pending',
              blocksProduction: title.toLowerCase().includes('razorpay') || 
                               title.toLowerCase().includes('payment'),
              description: this.generateDescription(title)
            });
          }
        }
      });
    }

    // Add remaining critical items if not found
    if (priorities.length < 2) {
      const defaultPriorities = [
        {
          id: 1,
          title: "Razorpay Backend API Implementation",
          priority: "CRITICAL",
          timeline: "4-6 hours",
          status: "pending",
          blocksProduction: true,
          description: "Build secure endpoints for payment creation and verification"
        },
        {
          id: 2,
          title: "Email Notification System",
          priority: "HIGH",
          timeline: "3-4 hours", 
          status: "pending",
          blocksProduction: false,
          description: "Set up Firebase Functions for order confirmation emails"
        },
        {
          id: 3,
          title: "Logistics Integration Setup",
          priority: "HIGH",
          timeline: "6-8 hours",
          status: "pending", 
          blocksProduction: false,
          description: "Establish shipping partnerships and fulfillment workflows"
        }
      ];
      
      return defaultPriorities;
    }

    return priorities;
  }

  parseStrategicPhases(content) {
    if (!content) return [];

    const phases = [];
    
    // Extract phases using regex
    const phaseMatches = content.match(/### \*\*Phase \d+:.*?(?=### \*\*Phase|\n## |$)/gs);
    
    if (phaseMatches) {
      phaseMatches.forEach((phaseText, index) => {
        const titleMatch = phaseText.match(/### \*\*Phase (\d+): (.+?)\*\*/);
        const timelineMatch = phaseText.match(/\*\*Timeline:\*\* (.+)/);
        const objectiveMatch = phaseText.match(/\*\*Objective:\*\* (.+)/);
        
        if (titleMatch) {
          const phaseNumber = parseInt(titleMatch[1]);
          const title = titleMatch[2].trim();
          
          // Extract initiatives
          const initiatives = [];
          const initiativeMatches = phaseText.match(/- ⬜ (.+)/g);
          if (initiativeMatches) {
            initiativeMatches.forEach(match => {
              initiatives.push(match.replace('- ⬜ ', '').trim());
            });
          }

          // Extract metrics
          const metrics = [];
          const metricsSection = phaseText.match(/\*\*Success Metrics:\*\*(.*?)(?=\*\*|$)/s);
          if (metricsSection) {
            const metricMatches = metricsSection[1].match(/- (.+)/g);
            if (metricMatches) {
              metricMatches.forEach(match => {
                metrics.push(match.replace('- ', '').trim());
              });
            }
          }

          // Extract resources
          const resources = [];
          const resourcesSection = phaseText.match(/\*\*Resources Required:\*\*(.*?)(?=\*\*|$)/s);
          if (resourcesSection) {
            const resourceMatches = resourcesSection[1].match(/- (.+)/g);
            if (resourceMatches) {
              resourceMatches.forEach(match => {
                resources.push(match.replace('- ', '').trim());
              });
            }
          }

          phases.push({
            id: phaseNumber,
            title: title,
            timeline: timelineMatch ? timelineMatch[1] : 'TBD',
            objective: objectiveMatch ? objectiveMatch[1] : '',
            status: phaseNumber === 0 ? 'current' : 'planned',
            initiatives: initiatives.slice(0, 8), // Limit for display
            metrics: metrics.slice(0, 6),
            resources: resources.slice(0, 4)
          });
        }
      });
    }

    return phases;
  }

  extractCategory(title) {
    if (title.includes('Security')) return 'Security';
    if (title.includes('Search')) return 'Search';
    if (title.includes('Media') || title.includes('Image')) return 'Performance';
    if (title.includes('E-commerce') || title.includes('Core')) return 'E-commerce';
    if (title.includes('Brand') || title.includes('Artisan')) return 'Brand';
    if (title.includes('Testing') || title.includes('Quality')) return 'Quality';
    if (title.includes('Admin')) return 'Admin';
    return 'Technical';
  }

  extractTimeline(text) {
    const timelineMatch = text.match(/(\d+-\d+ hours?|\d+ hours?|Day \d+-\d+)/i);
    return timelineMatch ? timelineMatch[1] : null;
  }

  determinePriority(title) {
    if (title.toLowerCase().includes('razorpay') || 
        title.toLowerCase().includes('payment') ||
        title.toLowerCase().includes('critical')) {
      return 'CRITICAL';
    }
    if (title.toLowerCase().includes('email') || 
        title.toLowerCase().includes('notification') ||
        title.toLowerCase().includes('logistics')) {
      return 'HIGH';
    }
    return 'MEDIUM';
  }

  generateDescription(title) {
    const descriptions = {
      'Razorpay Backend API Implementation': 'Build secure endpoints for payment creation and verification',
      'Email Notification System': 'Set up Firebase Functions for order confirmation emails',
      'Logistics Integration Setup': 'Establish shipping partnerships and fulfillment workflows',
      'Production deployment and testing': 'Deploy to production environment and conduct comprehensive testing',
      'Launch monitoring and analytics': 'Set up error tracking, performance monitoring, and business analytics'
    };
    
    return descriptions[title] || 'Complete implementation and testing';
  }

  async getAllRoadmapData() {
    try {
      const [completionContent, roadmapContent] = await Promise.all([
        this.fetchMarkdownFile('COMPLETION_STATUS_ANALYSIS.md'),
        this.fetchMarkdownFile('DEVELOPMENT_ROADMAP.md')
      ]);

      return {
        completedMilestones: this.parseCompletedMilestones(completionContent),
        immediatePriorities: this.parseImmediatePriorities(roadmapContent),
        strategicPhases: this.parseStrategicPhases(roadmapContent),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching roadmap data:', error);
      return {
        completedMilestones: [],
        immediatePriorities: [],
        strategicPhases: [],
        lastUpdated: new Date().toISOString(),
        error: error.message
      };
    }
  }
}

export const markdownDataLayer = new MarkdownDataLayer();