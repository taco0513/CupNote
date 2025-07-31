# Test Image Fixtures

This directory contains test images used in E2E tests for CupNote.

## Image Files

- `coffee-image.jpg` - Standard test coffee image (400x300px, ~50KB)
- `large-coffee-image.jpg` - Large test image for upload performance testing (2000x1500px, ~500KB)  
- `mobile-coffee-image.jpg` - Mobile-optimized test image (300x300px, ~25KB)
- `invalid-image.txt` - Invalid file for testing error handling
- `coffee-placeholder.svg` - SVG placeholder for testing vector image support

## Usage

These images are used in various E2E tests:

- **Coffee Record Tests**: Testing image upload functionality in coffee recording flow
- **Mobile Tests**: Testing image upload on mobile devices
- **Performance Tests**: Testing upload performance with large images
- **Error Handling Tests**: Testing invalid file upload scenarios

## Image Specifications

All test images should be:

- Coffee-related content
- Appropriate file sizes for testing scenarios
- Various formats (JPG, PNG, SVG) for format testing
- Different dimensions for responsive testing

## Adding New Test Images

When adding new test images:

1. Use coffee-related content
2. Follow naming convention: `[purpose]-coffee-image.[ext]`
3. Keep file sizes appropriate for test scenarios
4. Update this README with new image descriptions
5. Consider accessibility (alt text testing)

## File Size Guidelines

- Small: < 50KB (for quick upload tests)
- Medium: 50KB - 200KB (for standard upload tests)  
- Large: 200KB - 1MB (for performance testing)
- Extra Large: > 1MB (for stress testing)