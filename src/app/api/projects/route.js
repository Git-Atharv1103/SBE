import { NextResponse } from 'next/server';
import { getProjects, getProjectById, createProject, updateProject, deleteProject, getNextEstimateNumber } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');
    const nextNumber = searchParams.get('nextEstimateNumber');
    
    if (action === 'nextEstimateNumber' || nextNumber === 'true') {
      const nextEst = await getNextEstimateNumber();
      return NextResponse.json({ nextEstimateNumber: nextEst });
    }
    
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
    const body = await request.json();
    const projectData = body.projectData || body;
    const materialsList = body.materialsList || [];
    
    if (!projectData || (!projectData.projectName && !projectData.customerName)) {
      return NextResponse.json({ error: 'Project Name or Customer Name is required' }, { status: 400 });
    }
    
    const newProject = await createProject(projectData, materialsList);
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Create Project Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const id = body.id || body._id || body.projectData?._id;
    const projectData = body.projectData || body;
    const materialsList = body.materialsList || [];
    
    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }
    
    if (!projectData || (!projectData.projectName && !projectData.customerName)) {
      return NextResponse.json({ error: 'Project Name or Customer Name is required' }, { status: 400 });
    }
    
    const updated = await updateProject(id, projectData, materialsList);
    if (!updated) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update Project Error:', error);
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
