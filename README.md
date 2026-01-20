# WikiLovesINat

**WikiLovesINat** helps find Wikipedia articles or Wikidata entries lacking images for a species and suggests licensed images from [iNaturalist](https://www.inaturalist.org/). It simplifies enriching Wikipedia and Wikidata with freely licensed images.

---

## Features

- Find Wikipedia/Wikidata entries without images.
- Fetch licensed images from iNaturalist.
- Generate pre-filled upload forms for Wikimedia Commons.
- Automatically generate wikitext for Wikipedia/Wikidata.
- Search by conservation status, iNaturalist ID, Wikidata ID, username, or observation ID.

---

## Setup

1. **Clone the Repository**:
   ```
   git clone https://github.com/jdlrobson/WikiLovesINat.git
   
   cd WikiLovesINat
   ```
  3. **Install Dependencies**:
``` npm install ```
4. **Run** :
   ``` npx http-server ./public ```
5. **Access** :
    Open http://localhost:8080 in your browser.

## Usage

Search:
  Use the search bar to find species by iNaturalist ID, Wikidata ID, username, or observation ID.

Upload to Commons:
  Click "Upload to Commons" to open a pre-filled upload form on Wikimedia Commons.

Add to Wikipedia:
 Use the generated wikitext to add images to Wikipedia articles.

## Code Structure

public/index.html

public/index.js

public/inat.js: iNaturalist API interactions.

public/wikidata.js: Wikidata API interactions.

public/components/

  

**It is currently in a prototype stage and can be explored at https://wikilovesinat.netlify.app/** .
