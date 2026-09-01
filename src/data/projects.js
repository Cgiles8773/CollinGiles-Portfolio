const projects = [
  {
    slug: 'fourier-visualizer',
    title: 'Fourier Visualizer',
    description: 'Have you ever wondered how math can tell you the notes within a chord? This website lets you visually explore how the Fourier transform works.',
    image: new URL('../assets/fouriertransform.png', import.meta.url).href,
    tech: ['React', 'JavaScript'],
    skills: ['Signal Processing', 'Data Visualization', 'Interactive UI Design'],
    liveUrl: 'https://collin-giles-portfolio-1dkp.vercel.app/',
  },
  {
    slug: 'linear-regression',
    title: 'Linear Regression Demo',
    description: 'An interactive gradient descent visualizer, built from scratch in Python. Please note that while functional, the demo is still a work in progress!',
    tech: ['React', 'TypeScript', 'Python', 'Pyodide'],
    skills: ['Machine Learning', 'Algorithm Design', 'Python/JS Interop'],
    liveUrl: 'https://linear-regression-pearl.vercel.app/',
  },
  {
    slug: 'hubble',
    title: 'Hubble',
    description: 'Hubble is a reading app that encourages self reflection, closer communities, and strips out the endless scroll found in similar apps like Goodreads. Note: Hubble is my capstone project, and is still under development.',
    image: new URL('../assets/hubble.png', import.meta.url).href,
    tech: ['React', 'JavaScript', 'Supabase', 'Expo'],
    skills: ['Product Design', 'Mobile Development', 'Teamwork', 'API integration', 'Database Design'],
    liveUrl: 'https://readhubble.expo.app/',
  },
  {
    slug: 'boids',
    title: 'Boids',
    description: 'A flocking simulation built with the classic Boids algorithm, rendered in browser. The first \'artificial life\' algorithm I\'ve implemented, and an example of the perfect screensaver.',
    image: new URL('../assets/boids.png', import.meta.url).href,
    tech: ['React', 'JavaScript', 'Canvas'],
    skills: ['Emergent Systems', 'Simulation Design', 'Performance Optimization'],
    liveUrl: 'https://boids-jade.vercel.app/',
  },
  {
    slug: 'ascii-camera',
    title: 'ASCII Camera',
    description: 'An Ascii art generator, with adjustable parameters. This project was developed for fun over a couple of days, with all of the backend code written by hand. I plan to add edge aware characters, and even a real time camera filter.',
    image: new URL('../assets/ascii-art.png', import.meta.url).href,
    tech: ['React', 'JavaScript', 'Canvas'],
    skills: ['Image Processing', 'Real-Time Rendering', 'From-Scratch Algorithms'],
    liveUrl: 'https://asciicamera-olive.vercel.app/',
  },
]

export default projects
