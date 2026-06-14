async function test() {
  try {
    const res = await fetch("http://localhost:3000/api/market-data");
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Text snippet:", text.substring(0, 100));
  } catch (e: any) {
    console.error("Fetch failed:", e.message);
  }
}
test();
