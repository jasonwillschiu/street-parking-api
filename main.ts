import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import dataParking from "./street-parking-data.json" assert { type: "json" };
import dataTmr from "./tmr-api.json" assert { type: "json" };
import { logger } from 'https://deno.land/x/hono/middleware.ts'
import { serveStatic } from 'https://deno.land/x/hono/middleware.ts'

const app = new Hono();

// maybe this logs everything..
app.use('*', logger())

// parking api data
app.get("/street-parking-api", (c) => c.json(dataParking));

// tmr data
app.get("/tmr-api", (c) => {
  const licenseNum = c.req.query('licenseNum');

  // Check if 'licenseNum' is provided and is not empty
  if (!licenseNum) {
    return c.json({
      error: "licenseNum query parameter is required."
    }, 400); // Respond with 400 Bad Request
  }

  // Assuming 'dataTmr' is an array of objects and 'license_plate' is a property of these objects
  // Also, ensure 'licenseNum' is a string before calling toLowerCase to avoid runtime errors
  const filteredData = dataTmr.filter(x => x.license_plate.toLowerCase() === licenseNum.toLowerCase())[0];

  // If no matching data is found, you can decide how to handle this case.
  // For example, return a message indicating no data found or return an empty object
  if (!filteredData) {
    return c.json({
      error: "No data found for the provided licenseNum."
    }, 404); // Respond with 404 Not Found, or choose an appropriate response
  }

  return c.json({
    data: filteredData
  });
});

// static images and pdfs
app.get('/image1.jpg', serveStatic({path:'image1.jpg'}))
app.get('/image2.jpg', serveStatic({path:'image2.jpg'}))
app.get('/image3.jpg', serveStatic({path:'image3.jpg'}))
app.get('/infringement1.pdf', serveStatic({path:'Infringement1.pdf'}))
app.get('/infringement2.pdf', serveStatic({path:'Infringement2.pdf'}))
app.get('/infringement3.pdf', serveStatic({path:'Infringement3.pdf'}))

Deno.serve(app.fetch);
