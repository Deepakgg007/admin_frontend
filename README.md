# Task - Super Admin Dashboard

## Overview
Full-featured React admin dashboard for complete system management including universities, organizations, colleges, courses, and content creation.

## Tech Stack
- **React** 18.2.0
- **React Router** 6.4.2
- **Bootstrap** 5.3.0
- **React Bootstrap** 2.5.0
- **CKEditor 5** 41.4.2 (rich text editing)
- **React Beautiful DnD** 13.1.1 (drag-drop)
- **Chart.js** 3.9.1 (analytics)
- **React Data Table Component** 7.5.3
- **Axios** 1.11.0
- **SweetAlert2** 11.22.2

## Quick Start

```bash
npm install
npm start
# Opens at http://localhost:3000
```

## Features

### Organization Management
- **Universities** - CRUD operations
- **Organizations** - CRUD operations
- **Colleges** - CRUD operations with hierarchical structure

### Course System
- **Courses** - Create, edit, view, delete
- **Syllabi** - Curriculum management
- **Topics** - Topic organization
- **Tasks** - Individual learning units

### Task Content Management
The core feature for creating learning content:

#### Content Types
1. **Documents** - Upload PDFs, Word docs, files
2. **Videos** - YouTube links or direct uploads
3. **Questions** - MCQ and Coding challenges
4. **Rich Text Pages** - Block-based content (text, code, video blocks)

#### Task Content Manager
- Tab-based interface for each content type
- Drag-and-drop reordering
- Modal forms for create/edit
- Real-time updates
- Order badges
- Delete with confirmation

### Admin Dashboard
- System-wide analytics
- Course statistics
- User metrics
- Quick action cards
- Charts and visualizations

## Project Structure

```
Task/
├── public/                          # Static assets
├── src/
│   ├── pages/
│   │   ├── Universities/            # University CRUD
│   │   ├── Organizations/           # Organization CRUD
│   │   ├── Colleges/                # College CRUD
│   │   ├── Courses/
│   │   │   ├── CourseList.js
│   │   │   ├── CourseCreate.js
│   │   │   ├── CourseUpdate.js
│   │   │   └── CourseView.js
│   │   ├── Syllabus/                # Syllabus CRUD
│   │   ├── Topics/                  # Topic CRUD
│   │   └── Tasks/
│   │       ├── TaskList.js
│   │       ├── TaskCreate.js
│   │       ├── TaskUpdate.js
│   │       ├── TaskView.js
│   │       ├── TaskContentManager.js      ⭐ Main container
│   │       ├── TaskDocumentList.js        # Document management
│   │       ├── TaskVideoList.js           # Video management
│   │       ├── TaskQuestionList.js        # Question editor
│   │       └── TaskRichTextPageList.js    # Rich text pages
│   ├── components/
│   │   ├── Sidebar/                 # Navigation sidebar
│   │   ├── Header/                  # Top header
│   │   ├── ProtectedRoute/          # Auth guard
│   │   └── AdminOnly/               # Admin-only wrapper
│   ├── services/
│   │   └── apiBase.js              # Axios instance
│   ├── utilities/
│   │   └── auth.js                 # Auth helpers
│   ├── router/
│   │   └── index.js                # Route definitions
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## API Integration

### API Base URL
Configured in `src/services/apiBase.js`:
```javascript
export const API_BASE_URL = 'http://192.168.1.17:8000';
```

### Admin Authentication
```javascript
POST /api/auth/login/
// Requires: is_staff=True or is_superuser=True
```

### Key Endpoints
```
# Organization
GET/POST/PUT/DELETE   /api/universities/
GET/POST/PUT/DELETE   /api/organizations/
GET/POST/PUT/DELETE   /api/colleges/

# Courses
GET/POST/PUT/DELETE   /api/courses/courses/
GET/POST/PUT/DELETE   /api/courses/syllabi/
GET/POST/PUT/DELETE   /api/courses/topics/
GET/POST/PUT/DELETE   /api/courses/tasks/

# Task Content
GET/POST/PUT/DELETE   /api/courses/task-documents/
GET/POST/PUT/DELETE   /api/courses/task-videos/
GET/POST/PUT/DELETE   /api/courses/task-questions/
GET/POST/PUT/DELETE   /api/courses/task-richtextpages/

# Reordering
POST   /api/courses/task-documents/reorder/
POST   /api/courses/task-videos/reorder/
```

## Key Features

### Task Content Manager
Access via: `/Tasks/manage-content/:taskId`

**Features:**
- Tab interface (Documents, Videos, Questions, Rich Text)
- Upload files with progress
- Add YouTube videos
- Create MCQ questions
- Create coding challenges with test cases
- Build rich text pages with blocks
- Drag-and-drop reordering
- Edit/delete with modals
- Real-time order updates

### Drag-and-Drop
Powered by React Beautiful DnD:
- Smooth animations
- Visual feedback during drag
- Auto-save on drop
- Order persistence

### Rich Text Editor
CKEditor 5 integration:
- Formatting toolbar
- Image upload
- Code blocks
- Tables
- Lists
- Links

### Admin-Only Access
- Protected routes with `AdminRoute` component
- `AdminOnly` wrapper for components
- Backend permission checks (`IsAdminUserOrReadOnly`)
- Double security layer

### Data Tables
Features:
- Pagination
- Search/filter
- Sorting
- Actions column
- Responsive design
- Export functionality

## Development

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm start
```

### Build for Production
```bash
npm run build
```

### Environment Variables
Create `.env` file:
```env
REACT_APP_API_URL=http://192.168.1.17:8000
```

## Common Workflows

### Creating a Course
1. Navigate to Courses → Create Course
2. Fill in course details
3. Create Syllabus for course
4. Add Topics to Syllabus
5. Create Tasks for Topics
6. Add content to Tasks using Content Manager

### Managing Task Content
1. Navigate to Tasks → View Task
2. Click "Manage Content"
3. Add Documents, Videos, Questions, or Rich Text
4. Reorder items with drag-drop
5. Edit/delete as needed

### Creating Coding Challenge
1. Tasks → Manage Content → Questions tab
2. Select "Coding" question type
3. Add problem description
4. Define test cases (visible + hidden)
5. Set difficulty and points
6. Save question

## Best Practices

### Content Organization
- Use clear task titles
- Order content logically
- Mix content types for engagement
- Start with video/rich text, end with questions

### Question Design
- Clear, concise questions
- Include examples for coding challenges
- Mix difficulty levels
- Provide helpful test cases

### Performance
- Minimize large file uploads
- Optimize images before upload
- Use pagination for large lists
- Cache API responses when possible

## Troubleshooting

### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Drag-and-Drop Not Working
- Check React Beautiful DnD version
- Verify `droppableId` and `draggableId` are unique
- Check browser console for errors

### CKEditor Not Loading
- Verify CKEditor package is installed
- Check browser console
- Try clearing browser cache

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## License
Proprietary - Educational Platform Project
