// Replace each empty image path with the supplied image for this character.
// foundImage: image revealed when found; timeoutImage: alternate image after 30 seconds.
window.characters = Array.from({length:7}, (_, i) => ({
  name: `Character ${i + 1}`,
  foundImage: '',
  timeoutImage: '',
  foundText: 'A little luck, a perfect pop. You found the hidden star!',
  timeoutText: 'So close! I was hiding right here. Want another take?'
}));
