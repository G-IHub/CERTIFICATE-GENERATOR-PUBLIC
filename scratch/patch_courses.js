const fs = require('fs');
const path = require('path');

function patchCourses(relativeFilePath) {
  const filePath = path.join(__dirname, '..', relativeFilePath);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\r\n/g, '\n');

  // 1. Replace courseCount assignment
  const targetCourseCount = 'const courseCount = org.courses?.length || 0;';
  const replacementCourseCount = 'const courseCount = (org.courses || org.programs || []).length;';
  if (content.includes(targetCourseCount)) {
    content = content.replace(targetCourseCount, replacementCourseCount);
    console.log(`✅ Patched courseCount in ${relativeFilePath}`);
  }

  // 2. Replace courses array in orgData
  const targetOrgDataCourses = 'courses: org.courses || [],';
  const replacementOrgDataCourses = 'courses: org.courses || org.programs || [],';
  // Let's replace all occurrences in the file
  let occ = 0;
  while (content.includes(targetOrgDataCourses)) {
    content = content.replace(targetOrgDataCourses, replacementOrgDataCourses);
    occ++;
  }
  console.log(`✅ Patched ${occ} occurrences of org.courses in ${relativeFilePath}`);

  const finalContent = content.replace(/\n/g, '\r\n');
  fs.writeFileSync(filePath, finalContent, 'utf8');
}

patchCourses('supabase/functions/make-server-a611b057/index.ts');
patchCourses('src/aws/server/index.ts');
console.log("🎉 Course fallback patch completed!");
