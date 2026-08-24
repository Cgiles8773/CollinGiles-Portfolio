const projects = [
  {
    slug: 'fourier-visualizer',
    title: 'Fourier Visualizer',
    description: 'Have you ever wondered how math can tell you the notes within a chord? This website lets you visually explore how the Fourier transform works.',
    image: new URL('../assets/fouriertransform.png', import.meta.url).href,
    tech: ['React', 'JavaScript'],
    liveUrl: 'https://collin-giles-portfolio-1dkp.vercel.app/',
  },
  {
    slug: 'linear-regression',
    title: 'Linear Regression Demo',
    description: 'An interactive gradient descent visualizer, built from scratch in Python. Please note that while functional, the demo is still a work in progress!',
    tech: ['React', 'TypeScript', 'Python', 'Pyodide'],
    liveUrl: 'https://linear-regression-pearl.vercel.app/',
  },
  {
    slug: 'hubble',
    title: 'Hubble',
    description: 'Hubble is a reading app that encourages self reflection, closer communities, and strips out the endless scroll found in similar apps like Goodreads. Note: Hubble is my capstone project, and is still under development.',
    image: new URL('../assets/hubble.png', import.meta.url).href,
    tech: ['React', 'JavaScript'],
    liveUrl: 'https://readhubble.expo.app/',
  },
]

export default projects
