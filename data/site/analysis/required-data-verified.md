# ADYPU Required Data (Verified from Full Crawl)

Generated on: 2026-03-05  
Crawl scope: `https://adypu.edu.in/` (654 pages)

## 1) Crawl Output

- Raw HTML: `data/site/html/` (654 files)
- Extracted text: `data/site/text/` (654 files)
- Crawl manifest: `data/site/analysis/crawl-manifest.json`

## 2) High-Confidence Official Facts

### Vice Chancellor

- **Dr. Rakesh Kumar Jain**  
  Source: `data/site/text/adypu-edu-in-about-vice-chancellor-0166df49ac.txt:256`

### Registrar

- **Dr. Sudhakar Shinde**  
  Source: `data/site/text/adypu-edu-in-about-university-officials-8968f02265.txt:258`
- **Email:** `registrar@adypu.edu.in`  
  Source: `data/site/text/adypu-edu-in-about-university-officials-8968f02265.txt:326`

### Deans / School Leadership

- **Ar. Aparna Mhetras** - Dean, School of Design  
  Source: `data/site/text/adypu-edu-in-about-university-officials-8968f02265.txt:276`
- **Dr. Sunny Thomas** - Dean, School of Law and School of Liberal Arts  
  Source: `data/site/text/adypu-edu-in-about-university-officials-8968f02265.txt:342`
- **Dr. Vijay Kulkarni** - Dean, Student Service Division  
  Source: `data/site/text/adypu-edu-in-about-university-officials-8968f02265.txt:304`

### Student Service Division (SSD)

- **SSD Email:** `ssd@adypu.edu.in`  
  Source: `data/site/text/adypu-edu-in-student-service-division-d46aebcbc3.txt:284`

### Placement / Corporate Relations

- **Dr. Santosh P. Rao Borde** - Director, Students Progression & Corporate Relations Office  
  Source: `data/site/text/adypu-edu-in-placements-0f3dcc9b0f.txt` (content block around lines 320-380)
- **Dr. Tushar Ram Sangole** - Head, Training & Placement  
  Source: `data/site/text/adypu-edu-in-placements-0f3dcc9b0f.txt` (content block around lines 330-400)

### Fees / Mandatory Disclosures

- **Fees Structure (2024-2025) PDF link available on official Mandatory Disclosures page**
- **Fees Structure (2025-2026) PDF link available on official Mandatory Disclosures page**  
  Source: `data/site/html/adypu-edu-in-admissions-mandatory-disclosures-a87080f1c9.html:1251`  
  Source: `data/site/html/adypu-edu-in-admissions-mandatory-disclosures-a87080f1c9.html:1261`

Downloaded:
- `data/site/pdfs/fees-2024-25.pdf`
- `data/site/pdfs/fees-2025-26.pdf`

### Hostel

- Official hostel page found and downloaded.
- **Hostel contact number:** `+91-8087778799`  
  Source: `data/site/html/adypu-edu-in-campus-life-hostel-life-at-adypu-3b900aab2e.html:1393`

### International Partners / Collaborations

- ADYPU states **40 MoUs** across **10+ countries** on International Collaborations page.  
  Source: `data/site/text/adypu-edu-in-international-collaborations-c0b490d6d2.txt` (opening section)

## 3) Specific Checks Requested Earlier

- `Bhagyashri Vyas / bhagyashri.vyas@dypic.in`:
  - **Not found in official ADYPU crawl pages**.
  - Present only in local seed KB file (`data/kb/adypu_seed.json`), not confirmed on official crawl.

- `Seamedu`:
  - **No direct official-page hit found in this full crawl snapshot**.
  - May require targeted crawl of legacy/partner sub-pages if this is critical.

- `ULC 5`:
  - Found in event/social-type content mentions, not as an official SSD address field in core directory pages.

## 4) Important Data Quality Notes

- Menu/header text repeats across many pages and can create noisy entity matches (e.g., older names in nav fragments).
- Fees PDFs are scan-style; OCR is required for automatic row-level extraction.
- For RAG production, prefer using:
  - `about/vice-chancellor`
  - `about/university-officials`
  - `student-service-division`
  - `placements`
  - `admissions/mandatory-disclosures`
  - `international-collaborations`

