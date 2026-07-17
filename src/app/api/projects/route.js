import { NextResponse } from 'next/server';
import { getProjects, getProjectById, createProject, updateProject, deleteProject } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const project = await getProjectById(id);
      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      return NextResponse.json(project);
    }
    
    const projects = await getProjects();
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { projectData, materialsList } = await request.json();
    
    if (!projectData || !projectData.projectName || !projectData.customerId) {
      return NextResponse.json({ error: 'Project Name and Customer are required' }, { status: 400 });
    }
    
    if (!materialsList || !Array.isArray(materialsList)) {
      return NextResponse.json({ error: 'Materials list is required' }, { status: 400 });
    }
    
    const newProject = await createProject(projectData, materialsList);
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, projectData, materialsList } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }
    
    if (!projectData || !projectData.projectName || !projectData.customerId) {
      return NextResponse.json({ error: 'Project Name and Customer are required' }, { status: 400 });
    }
    
    if (!materialsList || !Array.isArray(materialsList)) {
      return NextResponse.json({ error: 'Materials list is required' }, { status: 400 });
    }
    
    const updated = await updateProject(id, projectData, materialsList);
    if (!updated) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }
    
    const deleted = await deleteProject(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
