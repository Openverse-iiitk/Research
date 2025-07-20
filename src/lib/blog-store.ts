// Blog post data store using localStorage
export interface BlogPost {
  id: string;
  title: string;
  content: string; // Markdown content
  excerpt: string;
  author: string;
  authorEmail: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  published: boolean;
  readTime: number; // estimated read time in minutes
}

const BLOG_STORAGE_KEY = 'openverse_blog_posts';

// Get all blog posts
export function getBlogPosts(): BlogPost[] {
  if (typeof window === 'undefined') return getDefaultBlogPosts();
  
  try {
    const stored = localStorage.getItem(BLOG_STORAGE_KEY);
    return stored ? JSON.parse(stored) : getDefaultBlogPosts();
  } catch (error) {
    console.error('Error loading blog posts:', error);
    return getDefaultBlogPosts();
  }
}

// Get published blog posts only
export function getPublishedBlogPosts(): BlogPost[] {
  return getBlogPosts().filter(post => post.published);
}

// Get blog post by ID
export function getBlogPostById(id: string): BlogPost | null {
  const posts = getBlogPosts();
  return posts.find(post => post.id === id) || null;
}

// Get blog posts by author
export function getBlogPostsByAuthor(authorEmail: string): BlogPost[] {
  return getBlogPosts().filter(post => post.authorEmail === authorEmail);
}

// Save blog posts to localStorage
function saveBlogPosts(posts: BlogPost[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(posts));
  } catch (error) {
    console.error('Error saving blog posts:', error);
  }
}

// Create a new blog post
export function createBlogPost(postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'readTime'>): boolean {
  try {
    const posts = getBlogPosts();
    const newPost: BlogPost = {
      ...postData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readTime: calculateReadTime(postData.content)
    };
    
    posts.unshift(newPost); // Add to beginning of array
    saveBlogPosts(posts);
    return true;
  } catch (error) {
    console.error('Error creating blog post:', error);
    return false;
  }
}

// Update an existing blog post
export function updateBlogPost(id: string, updates: Partial<Omit<BlogPost, 'id' | 'createdAt'>>): boolean {
  try {
    const posts = getBlogPosts();
    const index = posts.findIndex(post => post.id === id);
    
    if (index === -1) return false;
    
    posts[index] = {
      ...posts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      readTime: updates.content ? calculateReadTime(updates.content) : posts[index].readTime
    };
    
    saveBlogPosts(posts);
    return true;
  } catch (error) {
    console.error('Error updating blog post:', error);
    return false;
  }
}

// Delete a blog post
export function deleteBlogPost(id: string): boolean {
  try {
    const posts = getBlogPosts();
    const filteredPosts = posts.filter(post => post.id !== id);
    
    if (filteredPosts.length === posts.length) return false; // Post not found
    
    saveBlogPosts(filteredPosts);
    return true;
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return false;
  }
}

// Calculate estimated read time (assuming 200 words per minute)
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Generate a unique ID
function generateId(): string {
  return `blog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Default blog posts for demo
export function getDefaultBlogPosts(): BlogPost[] {
  const defaultPosts: BlogPost[] = [
    {
      id: 'blog_1640995200000_demo1',
      title: 'Building Neural Networks for Climate Prediction: A Journey into Deep Learning',
      content: `# Building Neural Networks for Climate Prediction

## Introduction

Climate change is one of the most pressing challenges of our time, and accurate prediction models are crucial for understanding and mitigating its impacts. Over the past few months, I've been working on developing neural networks that can predict climate patterns with greater accuracy than traditional models.

## The Challenge

Traditional climate models rely heavily on physical equations and statistical methods. While these approaches have been successful, they often struggle with:

- **Complex non-linear relationships** in atmospheric data
- **Large-scale pattern recognition** across multiple variables
- **Real-time processing** of massive datasets

## Our Approach

We're using a combination of **Convolutional Neural Networks (CNNs)** and **Long Short-Term Memory (LSTM)** networks to capture both spatial and temporal patterns in climate data.

### Key Components:

1. **Data Preprocessing Pipeline**
   - Satellite imagery processing
   - Temperature and humidity normalization
   - Feature extraction from weather station data

2. **Model Architecture**
   \`\`\`python
   # Simplified model structure
   model = Sequential([
       Conv2D(64, (3, 3), activation='relu'),
       MaxPooling2D(2, 2),
       LSTM(128, return_sequences=True),
       Dense(64, activation='relu'),
       Dense(1, activation='sigmoid')
   ])
   \`\`\`

3. **Training Strategy**
   - Transfer learning from pre-trained weather models
   - Data augmentation techniques
   - Cross-validation with historical data

## Results So Far

After 3 months of research and development:

- **15% improvement** in prediction accuracy compared to baseline models
- **Successfully predicted** temperature patterns 7 days in advance
- **Reduced computational time** by 40% using optimized architectures

## Challenges and Learnings

### Technical Challenges:
- **Data Quality**: Inconsistent weather station data required extensive cleaning
- **Computational Resources**: Training on climate data requires significant GPU power
- **Model Interpretability**: Understanding why the model makes certain predictions

### Key Learnings:
- The importance of domain expertise in feature engineering
- How ensemble methods can improve robustness
- The value of collaboration with meteorology experts

## Next Steps

Moving forward, we plan to:

1. **Expand the dataset** to include more geographic regions
2. **Implement attention mechanisms** for better interpretability
3. **Deploy a real-time prediction system** for local weather stations
4. **Collaborate with climate scientists** to validate our approaches

## Conclusion

This research has been incredibly rewarding, combining my passion for machine learning with real-world impact. Climate prediction is a complex problem, but I'm excited about the potential for AI to contribute to our understanding of climate systems.

*Stay tuned for more updates as we continue to push the boundaries of what's possible with neural networks in climate science!*

---

**Research Tools Used:** TensorFlow, PyTorch, NumPy, Pandas, Matplotlib
**Collaboration:** Dr. Sarah Chen (Meteorology), Climate Research Lab
**Duration:** 6 months (ongoing)`,
      excerpt: 'Exploring how neural networks can revolutionize climate prediction through deep learning techniques, achieving 15% improvement in accuracy over traditional models.',
      author: 'Alex Chen',
      authorEmail: 'alex.chen@iiitkottayam.ac.in',
      tags: ['Machine Learning', 'Climate Science', 'Neural Networks', 'Deep Learning', 'Research'],
      createdAt: '2024-12-15T10:30:00Z',
      updatedAt: '2024-12-15T10:30:00Z',
      published: true,
      readTime: 4
    },
    {
      id: 'blog_1640908800000_demo2',
      title: 'Quantum Computing Breakthrough: Implementing Shor\'s Algorithm',
      content: `# Quantum Computing Breakthrough: Implementing Shor's Algorithm

## Project Overview

For the past semester, I've been diving deep into quantum computing, specifically working on implementing and optimizing Shor's algorithm for integer factorization. This has been both the most challenging and rewarding research project of my academic career.

## Background

Shor's algorithm, developed by Peter Shor in 1994, is a quantum algorithm that can efficiently factor large integers. This has profound implications for cryptography, as many encryption schemes rely on the difficulty of factoring large numbers.

### Why This Matters:
- **Cryptographic Security**: Understanding quantum threats to current encryption
- **Quantum Supremacy**: Demonstrating quantum advantage over classical computers
- **Future-Proofing**: Preparing for the quantum computing era

## Implementation Journey

### Phase 1: Theoretical Foundation (Month 1-2)
- Studied quantum mechanics fundamentals
- Learned quantum circuit design
- Understood the mathematical basis of Shor's algorithm

### Phase 2: Simulation Environment (Month 3)
Working with **Qiskit** and **Cirq**, I built a simulation environment:

\`\`\`python
from qiskit import QuantumCircuit, Aer, execute
from qiskit.aqua.algorithms import Shor

# Basic Shor's algorithm implementation
def shors_algorithm(N):
    backend = Aer.get_backend('qasm_simulator')
    shor = Shor(N)
    result = shor.run(backend)
    return result.factors
\`\`\`

### Phase 3: Optimization and Testing (Month 4-5)
- **Quantum Error Correction**: Implemented basic error correction schemes
- **Circuit Optimization**: Reduced gate count by 30%
- **Noise Modeling**: Tested algorithm performance under realistic noise conditions

## Key Achievements

### Technical Milestones:
✅ Successfully factored numbers up to 21 on quantum simulator  
✅ Implemented quantum Fourier transform with 95% fidelity  
✅ Reduced circuit depth by 25% through gate optimization  
✅ Tested on IBM's real quantum hardware (5-qubit processor)  

### Research Contributions:
- **Novel Optimization Technique**: Developed a hybrid classical-quantum approach
- **Error Analysis**: Comprehensive study of noise effects on algorithm performance
- **Scalability Study**: Analysis of resource requirements for larger integers

## Challenges Faced

### Technical Hurdles:
1. **Quantum Decoherence**: Maintaining quantum states long enough for computation
2. **Limited Qubit Count**: Working within hardware constraints
3. **Gate Fidelity**: Dealing with imperfect quantum gates

### Solutions Developed:
- **Adaptive Circuits**: Dynamic circuit adjustment based on hardware characteristics
- **Error Mitigation**: Post-processing techniques to improve results
- **Hybrid Approaches**: Combining classical preprocessing with quantum computation

## Real-World Testing

We had the incredible opportunity to test our implementation on:
- **IBM Quantum Network**: 5-qubit and 16-qubit systems
- **Google Quantum AI**: Sycamore processor (limited access)
- **Rigetti Computing**: Forest platform

### Results:
- Successfully factored 15 on a 5-qubit IBM system
- Achieved 78% success rate on simulated 20-qubit systems
- Demonstrated quantum advantage for specific problem sizes

## Future Directions

### Short-term Goals (Next 6 months):
1. **Scale Up**: Target factorization of 3-digit numbers
2. **Hardware Optimization**: Develop hardware-specific optimizations
3. **Applications**: Explore cryptanalysis applications

### Long-term Vision:
- **Post-Quantum Cryptography**: Contribute to quantum-resistant encryption standards
- **Quantum Software**: Develop user-friendly quantum programming tools
- **Industry Collaboration**: Partner with cybersecurity companies

## Impact and Applications

This research has implications for:
- **National Security**: Understanding quantum threats to current encryption
- **Financial Systems**: Preparing banks for quantum-era security
- **Academic Research**: Contributing to quantum algorithm development
- **Technology Industry**: Informing quantum computing roadmaps

## Personal Reflections

Working on Shor's algorithm has been transformative. It's not just about the technical achievement, but about being part of a revolution in computing. Every small improvement feels like contributing to the future of technology.

The interdisciplinary nature of this work - combining physics, mathematics, and computer science - has broadened my perspective and shown me the importance of collaboration across fields.

## Acknowledgments

Special thanks to:
- **Dr. Rajesh Kumar** (Quantum Physics Lab) for mentorship
- **IBM Quantum Network** for hardware access
- **My research team** for countless debugging sessions
- **The quantum computing community** for open-source tools

---

**Next Update**: Planning to share our findings at the International Quantum Computing Conference next month!

*The quantum future is closer than we think, and I'm excited to be part of building it.*`,
      excerpt: 'Documenting the journey of implementing Shor\'s algorithm for quantum computing, achieving successful factorization on real quantum hardware.',
      author: 'Priya Sharma',
      authorEmail: 'priya.sharma@iiitkottayam.ac.in',
      tags: ['Quantum Computing', 'Cryptography', 'Algorithms', 'Physics', 'Computer Science'],
      createdAt: '2024-12-10T14:15:00Z',
      updatedAt: '2024-12-10T14:15:00Z',
      published: true,
      readTime: 6
    },
    {
      id: 'blog_1640822400000_demo3',
      title: 'Sustainable Agriculture Through IoT: Smart Farming Revolution',
      content: `# Sustainable Agriculture Through IoT: Smart Farming Revolution

## Introduction

Agriculture is at a crossroads. With growing global population and climate change, we need smarter, more sustainable farming methods. For the past 8 months, I've been working on an IoT-based smart farming solution that's showing promising results in optimizing crop yields while reducing environmental impact.

## The Problem

Traditional farming faces several challenges:
- **Water Scarcity**: Inefficient irrigation leading to waste
- **Pesticide Overuse**: Environmental damage and health concerns
- **Unpredictable Weather**: Climate change affecting crop planning
- **Labor Shortage**: Need for automated monitoring systems

## Our IoT Solution

### System Architecture

\`\`\`
[Sensors] → [Edge Computing] → [Cloud Platform] → [Mobile App]
    ↓              ↓               ↓              ↓
  Data Collection  Processing   Analytics    User Interface
\`\`\`

### Hardware Components:
1. **Soil Sensors**: Moisture, pH, nutrient levels
2. **Weather Stations**: Temperature, humidity, rainfall
3. **Camera Systems**: Crop health monitoring, pest detection
4. **Irrigation Controllers**: Automated watering systems
5. **Gateway Devices**: LoRaWAN for long-range communication

### Software Stack:
- **Backend**: Node.js with Express, MongoDB
- **Analytics**: Python with scikit-learn, TensorFlow
- **Frontend**: React Native mobile app
- **Cloud**: AWS IoT Core, Lambda functions

## Implementation Journey

### Phase 1: Sensor Network Deployment
Working with local farmers, we deployed sensor networks across 5 different farms:
- **Total Area**: 50 acres
- **Sensor Density**: 1 sensor per 0.5 acres
- **Crops Monitored**: Rice, wheat, tomatoes, peppers

### Phase 2: Data Collection and Analysis
Over 6 months, we collected:
- **2.5 million** sensor readings
- **10,000** weather data points
- **5,000** crop images for ML training
- **Daily** farmer input data

### Phase 3: Machine Learning Models
Developed predictive models for:
- **Irrigation Optimization**: Predicting optimal watering schedules
- **Disease Detection**: Early identification of plant diseases
- **Yield Prediction**: Forecasting crop yields based on conditions
- **Weather Adaptation**: Adjusting farming practices for weather changes

## Key Results

### Efficiency Improvements:
📈 **30% reduction** in water usage through smart irrigation  
📈 **25% increase** in crop yield across monitored farms  
📈 **40% reduction** in pesticide usage through early disease detection  
📈 **20% cost savings** in overall farming operations  

### Environmental Impact:
🌱 **Reduced chemical runoff** by 35%  
🌱 **Lower carbon footprint** through optimized resource usage  
🌱 **Improved soil health** through precision agriculture  
🌱 **Enhanced biodiversity** in surrounding areas  

## Technical Deep Dive

### Smart Irrigation Algorithm:
\`\`\`python
def calculate_irrigation_schedule(soil_moisture, weather_forecast, crop_stage):
    base_water_need = crop_water_requirements[crop_stage]
    
    # Adjust for current soil moisture
    moisture_factor = (target_moisture - current_moisture) / target_moisture
    
    # Consider weather predictions
    rain_probability = weather_forecast.get('rain_probability', 0)
    if rain_probability > 0.7:
        base_water_need *= 0.3  # Reduce irrigation if rain expected
    
    # Calculate final irrigation amount
    irrigation_amount = base_water_need * moisture_factor
    
    return {
        'amount': irrigation_amount,
        'timing': optimize_irrigation_timing(weather_forecast),
        'duration': calculate_duration(irrigation_amount, flow_rate)
    }
\`\`\`

### Disease Detection Model:
Using **Convolutional Neural Networks** trained on plant disease images:
- **Accuracy**: 92% for common diseases
- **Species Coverage**: 15 different crops
- **Real-time Processing**: < 2 seconds per image
- **Mobile Deployment**: TensorFlow Lite optimization

## Farmer Feedback and Adoption

### User Experience:
- **Mobile App Rating**: 4.6/5 stars
- **Daily Active Users**: 85% of enrolled farmers
- **Feature Usage**: Irrigation scheduling most popular (95% usage)

### Success Stories:
**Farmer A (Rice Production):**
> "The smart irrigation system saved me 40% on water bills and my rice yield increased by 35%. The app is easy to use even for someone like me who's not tech-savvy."

**Farmer B (Tomato Greenhouse):**
> "Early disease detection saved my entire crop last season. The system detected blight 5 days before I would have noticed it myself."

## Challenges and Solutions

### Technical Challenges:
1. **Connectivity Issues**: Rural areas have poor internet
   - *Solution*: LoRaWAN gateway for long-range, low-power communication
   
2. **Power Management**: Sensors need long battery life
   - *Solution*: Solar panels + efficient sleep modes
   
3. **Data Accuracy**: Environmental factors affecting sensors
   - *Solution*: Sensor fusion + calibration algorithms

### Adoption Challenges:
1. **Technology Literacy**: Some farmers hesitant about new tech
   - *Solution*: Comprehensive training programs + local support
   
2. **Initial Investment**: Upfront costs for equipment
   - *Solution*: Government subsidies + rental models

## Economic Impact

### Cost-Benefit Analysis:
- **Initial Investment**: ₹50,000 per acre (equipment + setup)
- **Annual Savings**: ₹25,000 per acre (water + labor + chemicals)
- **Payback Period**: 2 years
- **ROI after 5 years**: 300%

### Market Potential:
- **Addressable Market**: 600 million acres in India
- **Target Adoption**: 10% in next 5 years
- **Revenue Potential**: ₹30 billion annually

## Future Developments

### Short-term (Next 6 months):
1. **Drone Integration**: Aerial monitoring and spraying
2. **Blockchain**: Supply chain transparency
3. **AI Chatbot**: Voice-based farmer assistance in local languages

### Long-term Vision:
1. **Satellite Integration**: Large-scale crop monitoring
2. **Market Prediction**: Price forecasting for crop planning
3. **Carbon Credits**: Monetizing sustainable farming practices
4. **Global Expansion**: Adapting system for different climates

## Sustainability Impact

Our solution contributes to multiple UN Sustainable Development Goals:
- **Zero Hunger**: Increased food production
- **Clean Water**: Efficient water usage
- **Climate Action**: Reduced carbon footprint
- **Life on Land**: Improved soil health and biodiversity

## Research Publications

Current work has resulted in:
- **2 Conference Papers** (accepted at AgTech 2024, IoT World 2024)
- **1 Journal Paper** (under review at Computers and Electronics in Agriculture)
- **3 Patent Applications** filed for irrigation optimization algorithms

## Collaboration and Partnerships

Working with:
- **Local Agricultural Universities** for crop science expertise
- **Government Extension Services** for farmer outreach
- **Technology Companies** for hardware optimization
- **NGOs** for sustainable development programs

## Personal Reflection

This project has been eye-opening in many ways. Working directly with farmers has taught me that technology is only as good as its practical application. The real challenge isn't just building the system - it's making it accessible, affordable, and genuinely helpful for people whose livelihoods depend on it.

Seeing a farmer save their crop because of early disease detection, or watching water usage drop by 30% while yields increase - these moments make all the late nights debugging sensors worth it.

## Conclusion

Smart farming through IoT isn't just about technology - it's about creating a sustainable future for agriculture. Our results show that with the right combination of sensors, data analytics, and farmer engagement, we can significantly improve both productivity and sustainability.

The journey is far from over. Climate change will continue to challenge agriculture, but I'm optimistic that technology can be part of the solution. Every sensor deployed, every algorithm optimized, and every farmer trained brings us closer to a more sustainable agricultural future.

*Stay tuned for updates as we scale this solution to more farms and explore new frontiers in agricultural technology!*

---

**Project Duration**: 8 months (ongoing)  
**Team Size**: 6 students + 2 faculty advisors  
**Funding**: Government innovation grant + industry partnership  
**Next Milestone**: Scaling to 500 acres by end of year`,
      excerpt: 'Revolutionizing agriculture through IoT sensors and machine learning, achieving 30% water savings and 25% yield improvement across smart farms.',
      author: 'Rahul Verma',
      authorEmail: 'rahul.verma@iiitkottayam.ac.in',
      tags: ['IoT', 'Agriculture', 'Sustainability', 'Machine Learning', 'Smart Farming'],
      createdAt: '2024-12-05T09:45:00Z',
      updatedAt: '2024-12-05T09:45:00Z',
      published: true,
      readTime: 8
    },
    {
      id: 'blog_1640736000000_demo4',
      title: 'Cybersecurity in Healthcare: Protecting Patient Data with AI',
      content: `# Cybersecurity in Healthcare: Protecting Patient Data with AI

## The Critical Need

Healthcare data breaches have increased by 55% in the last two years. With the digitization of medical records and the rise of telemedicine, protecting patient data has never been more crucial. My research focuses on developing AI-powered cybersecurity solutions specifically designed for healthcare environments.

## Research Overview

For the past 6 months, I've been working on **intelligent intrusion detection systems** that can identify and prevent cyber attacks on healthcare networks in real-time.

### Key Components:
1. **Anomaly Detection**: ML models trained on network traffic patterns
2. **Behavioral Analysis**: AI monitoring of user access patterns
3. **Threat Intelligence**: Integration with global threat databases
4. **Automated Response**: Rapid containment of identified threats

## Early Results

Our prototype system has shown:
- **97% accuracy** in detecting unknown malware
- **2-second response time** for threat containment
- **Zero false positives** in a 30-day hospital trial
- **40% reduction** in security incident response time

## Current Challenges

The main challenges we're addressing:
- **Legacy System Integration**: Many hospitals use outdated systems
- **Real-time Processing**: Healthcare systems can't afford downtime
- **Privacy Compliance**: Ensuring HIPAA and GDPR compliance
- **User Experience**: Security shouldn't impede medical care

## Future Plans

Next phase involves:
1. **Federated Learning**: Training models across multiple hospitals without sharing sensitive data
2. **IoT Security**: Protecting connected medical devices
3. **Predictive Threat Modeling**: Anticipating future attack vectors
4. **Blockchain Integration**: Immutable audit trails for patient data access

## Impact Goals

By the end of this research, we aim to:
- Deploy in 5 major hospitals
- Reduce healthcare data breaches by 60%
- Create open-source security tools for smaller clinics
- Train the next generation of healthcare cybersecurity professionals

*This research is more than academic - it's about protecting the most sensitive data we have: our health information.*

---

**Research Partner**: Regional Medical Center  
**Funding**: National Cybersecurity Initiative Grant  
**Timeline**: 18-month project (6 months completed)`,
      excerpt: 'Developing AI-powered cybersecurity solutions for healthcare, achieving 97% accuracy in threat detection while maintaining HIPAA compliance.',
      author: 'Neha Patel',
      authorEmail: 'neha.patel@iiitkottayam.ac.in',
      tags: ['Cybersecurity', 'Healthcare', 'Artificial Intelligence', 'Privacy', 'HIPAA'],
      createdAt: '2024-11-28T16:20:00Z',
      updatedAt: '2024-11-28T16:20:00Z',
      published: true,
      readTime: 3
    }
  ];

  // Save default posts to localStorage
  saveBlogPosts(defaultPosts);
  return defaultPosts;
}

// Search blog posts
export function searchBlogPosts(query: string): BlogPost[] {
  const posts = getPublishedBlogPosts();
  const searchTerms = query.toLowerCase().split(' ');
  
  return posts.filter(post => {
    const searchableText = `${post.title} ${post.content} ${post.excerpt} ${post.tags.join(' ')}`.toLowerCase();
    return searchTerms.every(term => searchableText.includes(term));
  });
}

// Get blog posts by tag
export function getBlogPostsByTag(tag: string): BlogPost[] {
  return getPublishedBlogPosts().filter(post => 
    post.tags.some(postTag => postTag.toLowerCase() === tag.toLowerCase())
  );
}

// Get all tags
export function getAllTags(): string[] {
  const posts = getPublishedBlogPosts();
  const allTags = posts.flatMap(post => post.tags);
  return Array.from(new Set(allTags)).sort();
}
