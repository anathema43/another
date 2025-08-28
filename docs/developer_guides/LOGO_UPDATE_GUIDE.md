# 🎨 Logo Update Instructions

## 🚀 **Recommended Method: Using the Automated Script**

You now have a powerful automated script to update your logo throughout the entire application!

### **How to Use:**

1. **Install dependencies (first time only):**
   ```bash
   npm install
   ```

2. **Run the update script:**
   ```bash
   npm run update-logo <path-to-your-logo-file>
   ```

3. **Example usage:**
   ```bash
   npm run update-logo ~/Downloads/my-new-logo.png
   npm run update-logo ./assets/company-logo.jpg
   npm run update-logo /Users/you/Desktop/logo.svg
   ```

4. **Restart your development server:**
   ```bash
   npm run dev
   ```

### **What the Script Does:**

✅ **Validates your file** - Checks if it's a valid image under 5MB  
✅ **Backs up current logo** - Saves your old logo with timestamp  
✅ **Converts to SVG** - Optimizes any image format for web usage  
✅ **Updates logo** - Replaces `src/assets/logo.svg`  
✅ **Adds dynamic coloring** - Ensures it works with your color schema  

### **Example Output:**

```bash
$ npm run update-logo ./my-new-logo.png

🏔️  Darjeeling Soul Logo Updater
=====================================

📍 Checking file: /Users/you/project/my-new-logo.png
✅ File validation passed
✅ Current logo backed up to: src/assets/logo-backup-1704123456789.svg
📍 Created directory: src/assets
✅ Logo updated successfully!
📍 New logo location: src/assets/logo.svg
🎨 SVG optimized for web usage

🎉 Logo Update Complete!
========================
💾 Previous logo backed up to: src/assets/logo-backup-1704123456789.svg

📋 Next Steps:
1. Restart your development server:
   npm run dev

2. Or rebuild your project:
   npm run build

3. Your new logo will appear throughout the application!

💡 Pro Tips:
• Your logo will automatically adapt to different colors using CSS
• Use className="text-nyano-terracotta" to make it terracotta colored
• Use className="text-white" for white logo on dark backgrounds
• The logo is now fully responsive and accessible
```

### **Supported File Formats:**

- **PNG** - Converted to optimized SVG
- **JPG/JPEG** - Converted to optimized SVG  
- **SVG** - Optimized and enhanced for dynamic coloring
- **WebP** - Converted to optimized SVG

### **File Requirements:**

- **Size**: Under 5MB (typical logos are much smaller)
- **Quality**: High resolution recommended for best results
- **Colors**: Any colors work - script adds dynamic coloring support

---

## 🔧 **Alternative Method: Manual Replacement**

If you prefer to update the logo manually or need more control over the process:

### **Manual Steps:**

1. **Prepare your logo file:**
   - Convert to SVG format (recommended for scalability)
   - Ensure it's optimized for web usage
   - Size should be reasonable (under 1MB)

2. **Replace the logo file:**
   - Navigate to `src/assets/`
   - Replace `logo.svg` with your new logo file
   - Keep the filename as `logo.svg`

3. **For dynamic coloring (optional):**
   - Open your SVG in a text editor
   - Replace `fill="#color"` with `fill="currentColor"`
   - Replace `stroke="#color"` with `stroke="currentColor"`

4. **Test the update:**
   ```bash
   npm run dev
   ```

### **Where Your Logo Appears:**

After updating (either method), your new logo will automatically appear in:
- 🏠 **Homepage hero section**
- 🧭 **Navigation bar**
- 🦶 **Footer**
- 🔐 **Login page**
- 📝 **Signup page**
- ℹ️ **About page**
- ⏳ **Loading screens**

---

## 🆘 **Troubleshooting:**

### **Common Issues:**

**"File not found"**
- Check the file path is correct
- Use absolute path or relative to project root
- Ensure file exists and is accessible

**"Invalid file type"**
- Only image files are supported (PNG, JPG, SVG, WebP)
- Convert other formats using online tools

**"Logo not updating"**
- Restart your development server: `npm run dev`
- Clear browser cache: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Check browser console for errors

**"Colors not working"**
- The script automatically adds `currentColor` for dynamic styling
- Use CSS classes like `text-white` or `text-nyano-terracotta` to change colors

**"Script fails to run"**
- Ensure you have Node.js installed
- Run `npm install` to install dependencies
- Check file permissions on your logo file

### **Advanced Usage:**

**Restore previous logo:**
```bash
# Find your backup file in src/assets/
# Copy it back to logo.svg manually, or run the script again
npm run update-logo src/assets/logo-backup-1704123456789.svg
```

**Batch processing multiple logos:**
```bash
# Update logo for different environments
npm run update-logo ./logos/development-logo.png
npm run update-logo ./logos/staging-logo.png  
npm run update-logo ./logos/production-logo.png
```

---

## 🎯 **Benefits of This Approach:**

✅ **Simple**: One command updates logo everywhere  
✅ **Safe**: Automatic backup of current logo  
✅ **Optimized**: Images are converted and optimized for web  
✅ **Dynamic**: Logo adapts to your color schema  
✅ **Consistent**: Updates all instances throughout the app  
✅ **Professional**: Handles edge cases and provides clear feedback

**Your logo update process is now streamlined and foolproof!** 🏔️