@@ .. @@
             {/* Committee Member routes */}
-            {currentUser.role === 'committee_member' && (
-              <>
-                <Route path="/my-timetable" element={<MyTimetable />} />
-                <Route path="/leave-management" element={<LeaveManagement />} />
-                <Route path="/my-leaves" element={<MyLeaves />} />
-                <Route path="/my-achievements" element={<MyAchievements />} />
-              </>
-            )}
-            
-            {/* Faculty-only routes */}
             {currentUser.role === 'faculty' && (
               <>
                 <Route path="/mark-attendance" element={<MarkAttendance />} />