# 🎨 Logo Update Instructions

## 🚀 **Quick Logo Update**

You now have a simple script to update your logo throughout the entire application!

### **How to Use:**

1. **Run the update script:**
   ```bash
   npm run update-logo
   ```

2. **Enter the path to your new logo:**
   ```
   📁 Enter the path to your new logo file (SVG format): /path/to/your/new-logo.svg
   ```

3. **Restart your development server:**
   ```bash
   npm run dev
   ```

### **What the Script Does:**

✅ **Validates your file** - Checks if it's a valid SVG under 5MB  
✅ **Backs up current logo** - Saves your old logo with timestamp  
✅ **Optimizes SVG** - Cleans up the code for web usage  
✅ **Updates logo** - Replaces `src/assets/logo.svg`  
✅ **Adds dynamic coloring** - Ensures it works with your color schema  

### **Example Usage:**

```bash
$ npm run update-logo

🏔️  Darjeeling Soul Logo Updater
=====================================

📁 Enter the path to your new logo file (SVG format): ./my-new-logo.svg

🔍 Checking file: /Users/you/project/my-new-logo.svg
✅ File validation passed
✅ Current logo backed up to: src/assets/logo-backup-1704123456789.svg
📁 Created directory: src/assets
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

### **File Requirements:**

- **Format**: SVG only (for scalability and dynamic coloring)
- **Size**: Under 5MB (typical SVGs are much smaller)
- **Colors**: Use `currentColor` or no fill/stroke for dynamic coloring

### **Where Your Logo Appears:**

After updating, your new logo will automatically appear in:
- 🏠 **Homepage hero section**
- 🧭 **Navigation bar**
- 🦶 **Footer**
- 🔐 **Login page**
- 📝 **Signup page**
- ℹ️ **About page**
- ⏳ **Loading screens**

### **Troubleshooting:**

**"File not found"**
- Check the file path is correct
- Use absolute path or relative to project root

**"Invalid file type"**
- Only SVG files are supported
- Convert PNG/JPG to SVG using online tools

**"Logo not updating"**
- Restart your development server: `npm run dev`
- Clear browser cache: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

**"Colors not working"**
- Ensure your SVG uses `currentColor` for fill/stroke
- The script automatically adds this if missing

### **Advanced Usage:**

**Update logo with specific optimizations:**
```bash
# The script automatically optimizes your SVG by:
# • Removing comments and unnecessary whitespace
# • Adding proper xmlns attributes
# • Adding currentColor for dynamic styling
# • Cleaning up empty attributes
```

**Restore previous logo:**
```bash
# Find your backup file in src/assets/
# Copy it back to logo.svg manually, or run the script again
npm run update-logo
# Then enter the path to your backup file
```

---

## 🎯 **Benefits of This Approach:**

✅ **Simple**: One command updates logo everywhere  
✅ **Safe**: Automatic backup of current logo  
✅ **Optimized**: SVG is cleaned and optimized for web  
✅ **Dynamic**: Logo adapts to your color schema  
✅ **Consistent**: Updates all instances throughout the app  

**Your logo update process is now streamlined and foolproof!** 🏔️