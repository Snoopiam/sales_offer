
## Migration Plan: Image-based to Editable Text-based PDFs

### Current State
- Using **html2pdf.js** which converts HTML to canvas images
- Results in non-selectable, non-editable PDFs
- High quality but large file sizes

### Target State
- Using **jsPDF** with **jsPDF-autotable** for structured data
- Text remains selectable and editable
- Smaller file sizes, faster generation

### Implementation Strategy

**Phase 1: Library Setup**
1. Add jsPDF and jsPDF-autotable libraries to index.html
2. Keep html2pdf.js as fallback initially

**Phase 2: Data Extraction**
1. Create functions to extract all text data from the form
2. Extract property details, financial breakdown, payment plan tables
3. Extract branding info (project name, logo)

**Phase 3: PDF Generation Logic**
1. Create new `generateEditablePDF()` function
2. Layout header with logo and branding
3. Render Property Details table using jsPDF-autotable
4. Render Financial Breakdown table
5. Render Payment Plan table
6. Add footer with project name
7. Handle landscape/portrait orientations

**Phase 4: Styling**
1. Match current color scheme (teal #62c6c1)
2. Apply fonts (match current typography)
3. Table styling to match current design
4. Proper spacing and margins

**Phase 5: Image Handling**
1. Embed floor plan image (right side)
2. Embed logo as base64 or image
3. Handle image scaling and positioning

**Phase 6: Testing & Refinement**
1. Test with various data scenarios
2. Compare visual output with current PDFs
3. Verify text selectability
4. Test file size reduction

**Phase 7: Deployment**
1. Replace old export function
2. Update user documentation
3. Add option to choose between formats (optional)

