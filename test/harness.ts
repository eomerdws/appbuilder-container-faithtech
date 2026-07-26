// Minimal Worker entry so the Workers test pool has something to load. Tests
// import and exercise the server modules directly rather than via fetch.
export default {
  fetch() {
    return new Response('ok');
  }
};
