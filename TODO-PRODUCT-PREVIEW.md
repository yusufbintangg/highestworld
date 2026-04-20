# TODO: ProductFormModal Image Preview 📸

## Status: [ ] 0% Complete

### Step 1: Analyze ProductFormModal [ ]
- File: `src/app/components/admin/ProductFormModal.jsx`
- Images field: textarea (split \\n URLs)
- Goal: preview di bawah input

### Step 2: Copy Preview Logic from EditVariantModal [✅]
- State: previewImages array + useEffect sync
- onChange → split/filter/slice(8) → grid preview
- onError → hide broken image

### Step 3: Implement Preview UI [ ]
```
Images textarea
┌─────────────┐ ┌─────────────┐
│ Preview 1   │ │ Preview 2   │  ← responsive grid
└─────────────┘ └─────────────┘
```

### Step 4: Test Add/Edit Product [ ]
- [ ] URL valid → instant preview
- [ ] Multiple URLs → grid
- [ ] Broken URL → hide graceful

**Next: read ProductFormModal → implement preview!**
