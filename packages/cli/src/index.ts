#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';

const program = new Command();

program
  .name('omniforge')
  .description('OmniForge CLI - Build apps from ideas')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize a new OmniForge project')
  .option('-d, --dir <dir>', 'Project directory', './omniforge-project')
  .action(async (options) => {
    console.log('🚀 Initializing OmniForge project...');
    
    const projectDir = path.resolve(options.dir);
    
    try {
      await fs.mkdir(projectDir, { recursive: true });
      
      // Create basic structure
      await fs.writeFile(
        path.join(projectDir, 'package.json'),
        JSON.stringify({
          name: path.basename(projectDir),
          version: '0.1.0',
          private: true,
          scripts: {
            dev: 'omniforge dev',
            build: 'omniforge build',
            deploy: 'omniforge deploy',
          },
        }, null, 2)
      );
      
      await fs.writeFile(
        path.join(projectDir, '.omniforge.json'),
        JSON.stringify({
          version: '0.1.0',
          ideaId: null,
          projectId: null,
        }, null, 2)
      );
      
      console.log(`✅ Project initialized at ${projectDir}`);
      console.log('📝 Next steps:');
      console.log(`  cd ${path.basename(projectDir)}`);
      console.log('  omniforge create "Your app idea"');
    } catch (error) {
      console.error('❌ Error initializing project:', error.message);
      process.exit(1);
    }
  });

program
  .command('create <idea>')
  .description('Create a new idea and start building')
  .option('-t, --title <title>', 'Idea title')
  .option('-d, --description <description>', 'Idea description')
  .action(async (idea, options) => {
    console.log('💡 Creating idea...');
    
    try {
      const response = await fetch('http://localhost:3001/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'cli-user',
          title: options.title || idea,
          description: options.description || idea,
          rawInput: idea,
        }),
      });
      
      const data = await response.json();
      
      console.log(`✅ Idea created: ${data.id}`);
      console.log(`📋 Title: ${data.title}`);
      console.log(`\n🔗 View at: http://localhost:3000/dashboard/ideas/${data.id}`);
      console.log(`\n💻 Parse idea: omniforge parse ${data.id}`);
    } catch (error) {
      console.error('❌ Error creating idea:', error.message);
      process.exit(1);
    }
  });

program
  .command('parse <ideaId>')
  .description('Parse an idea into a specification')
  .action(async (ideaId) => {
    console.log(`🔍 Parsing idea ${ideaId}...`);
    
    try {
      const response = await fetch(`http://localhost:3001/api/ideas/${ideaId}/parse`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      console.log('✅ Idea parsed successfully!');
      console.log(`📊 Status: ${data.status}`);
      console.log(`\n💻 Build project: omniforge build ${ideaId}`);
    } catch (error) {
      console.error('❌ Error parsing idea:', error.message);
      process.exit(1);
    }
  });

program
  .command('build <ideaId>')
  .description('Build a project from an idea')
  .option('-n, --name <name>', 'Project name')
  .action(async (ideaId, options) => {
    console.log(`🏗️  Building project from idea ${ideaId}...`);
    
    try {
      // Create project
      const projectResponse = await fetch('http://localhost:3001/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId,
          userId: 'cli-user',
          name: options.name || 'Generated Project',
        }),
      });
      
      const project = await projectResponse.json();
      
      // Build project
      const buildResponse = await fetch(`http://localhost:3001/api/projects/${project.id}/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      
      const build = await buildResponse.json();
      
      console.log('✅ Build started!');
      console.log(`📦 Project: ${project.id}`);
      console.log(`🔨 Build: ${build.id}`);
      console.log(`\n📊 View build: http://localhost:3000/dashboard/projects/${project.id}`);
      console.log(`\n💻 Deploy: omniforge deploy ${project.id}`);
    } catch (error) {
      console.error('❌ Error building project:', error.message);
      process.exit(1);
    }
  });

program
  .command('deploy <projectId>')
  .description('Deploy a project')
  .option('-p, --platform <platform>', 'Deployment platform', 'vercel')
  .action(async (projectId, options) => {
    console.log(`🚀 Deploying project ${projectId} to ${options.platform}...`);
    
    try {
      const response = await fetch('http://localhost:3001/api/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          userId: 'cli-user',
          platform: options.platform,
        }),
      });
      
      const data = await response.json();
      
      console.log('✅ Deployment started!');
      console.log(`📦 Deployment: ${data.id}`);
      console.log(`\n📊 View deployment: http://localhost:3000/dashboard/projects/${projectId}`);
    } catch (error) {
      console.error('❌ Error deploying project:', error.message);
      process.exit(1);
    }
  });

program
  .command('status <resourceId>')
  .description('Check status of an idea, project, or build')
  .option('-t, --type <type>', 'Resource type (idea|project|build)', 'idea')
  .action(async (resourceId, options) => {
    console.log(`📊 Checking status of ${options.type} ${resourceId}...`);
    
    try {
      let endpoint = '';
      switch (options.type) {
        case 'idea':
          endpoint = `http://localhost:3001/api/ideas/${resourceId}`;
          break;
        case 'project':
          endpoint = `http://localhost:3001/api/projects/${resourceId}`;
          break;
        case 'build':
          endpoint = `http://localhost:3001/api/builds/${resourceId}`;
          break;
        default:
          throw new Error(`Unknown type: ${options.type}`);
      }
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      console.log(`\n✅ Status: ${data.status || 'N/A'}`);
      if (data.createdAt) {
        console.log(`📅 Created: ${new Date(data.createdAt).toLocaleString()}`);
      }
    } catch (error) {
      console.error('❌ Error checking status:', error.message);
      process.exit(1);
    }
  });

program.parse();

