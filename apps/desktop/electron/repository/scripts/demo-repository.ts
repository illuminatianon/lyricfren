#!/usr/bin/env tsx

import * as path from 'path';
import fs from 'fs-extra';
import { SongRepository, SongContent, SongMetadata } from '../examples/SongRepository';
import { Entity } from '../types';

/**
 * Demo script to create a repository and perform various operations
 * Usage: tsx demo-repository.ts [path]
 * 
 * This script will:
 * 1. Create a new SongRepository at the specified path
 * 2. Perform various operations (save, modify, fork)
 * 3. Show Git history and status at each step
 */

async function runDemo(repoPath: string) {
  console.log(`🎵 Creating SongRepository demo at: ${repoPath}`);
  console.log('='.repeat(60));

  // Clean up existing directory if it exists
  if (await fs.pathExists(repoPath)) {
    console.log('📁 Removing existing directory...');
    await fs.remove(repoPath);
  }

  const repository = new SongRepository(repoPath);

  // Step 1: Initialize repository
  console.log('\n📦 Step 1: Initializing repository...');
  await repository.initialize();
  console.log('✅ Repository initialized');
  await showGitStatus(repoPath, 'After initialization');

  // Step 2: Get initial entity and examine it
  console.log('\n📄 Step 2: Getting initial entity...');
  const initialEntity = await repository.getLatest();
  console.log('✅ Initial entity retrieved');
  console.log(`   Repository ID: ${initialEntity.repositoryId}`);
  console.log(`   Revision ID: ${initialEntity.revisionId}`);
  console.log(`   Structure: ${initialEntity.content.structure.join(', ')}`);

  // Step 3: Create first song version
  console.log('\n🎼 Step 3: Creating first song version...');
  const firstSong: Entity<SongContent, SongMetadata> = {
    ...initialEntity,
    content: {
      lyrics: `# My First Song

[Verse 1]
Walking down the street today
Sunshine lighting up my way
Everything feels so bright and new
All because I'm here with you

[Chorus]
This is my first song
Hope it won't be long
Before you hear the melody
That's been inside of me

[Verse 2]
Dreams are dancing in my head
Words that need to be said
Music flowing through my soul
Making broken pieces whole

[Chorus]
This is my first song
Hope it won't be long
Before you hear the melody
That's been inside of me

[Bridge]
Every note and every line
Tells a story that is mine
From my heart to your ears
Through the laughter and the tears
`,
      structure: ['Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Bridge'],
      sections: {}
    },
    metadata: {
      ...initialEntity.metadata,
      title: 'My First Song',
      genre: 'Pop',
      bpm: 120,
      key: 'C Major',
      timeSignature: '4/4',
      tags: ['original', 'pop', 'upbeat'],
      collaborators: ['Demo User'],
      inspiration: 'A beautiful sunny day',
      notes: 'First attempt at songwriting'
    },
    changes: {
      content: true,
      metadata: true,
      fields: ['content', 'metadata']
    }
  };

  const savedSong = await repository.save(firstSong);
  console.log('✅ First song saved');
  console.log(`   New revision: ${savedSong.revisionId}`);
  await showGitStatus(repoPath, 'After saving first song');

  // Step 4: Make a small lyric change
  console.log('\n✏️  Step 4: Making lyric changes...');
  const modifiedSong: Entity<SongContent, SongMetadata> = {
    ...savedSong,
    content: {
      ...savedSong.content,
      lyrics: savedSong.content.lyrics.replace(
        'Everything feels so bright and new',
        'Everything feels so fresh and new'
      )
    },
    changes: {
      content: true,
      metadata: false,
      fields: ['content']
    }
  };

  const updatedSong = await repository.save(modifiedSong);
  console.log('✅ Lyrics updated');
  console.log(`   New revision: ${updatedSong.revisionId}`);
  await showGitStatus(repoPath, 'After lyric changes');

  // Step 5: Update metadata only
  console.log('\n🏷️  Step 5: Updating metadata...');
  const metadataUpdate: Entity<SongContent, SongMetadata> = {
    ...updatedSong,
    metadata: {
      ...updatedSong.metadata,
      bpm: 125,
      tags: [...updatedSong.metadata.tags, 'revised'],
      notes: 'Updated BPM and added revision tag'
    },
    changes: {
      content: false,
      metadata: true,
      fields: ['metadata']
    }
  };

  const finalSong = await repository.save(metadataUpdate);
  console.log('✅ Metadata updated');
  console.log(`   New revision: ${finalSong.revisionId}`);
  await showGitStatus(repoPath, 'After metadata update');

  // Step 6: Create a fork
  console.log('\n🍴 Step 6: Creating repository fork...');
  const forkPath = path.join(path.dirname(repoPath), `${path.basename(repoPath)}-fork`);

  if (await fs.pathExists(forkPath)) {
    await fs.remove(forkPath);
  }

  const forkedRepo = await repository.fork(savedSong.revisionId, forkPath);
  console.log('✅ Repository forked');
  console.log(`   Fork path: ${forkPath}`);
  console.log(`   Forked from revision: ${savedSong.revisionId}`);
  await showGitStatus(forkPath, 'Fork repository state');

  // Step 7: Show final summary
  console.log('\n📊 Step 7: Final summary...');
  await showRepositorySummary(repository, repoPath);

  console.log('\n🎯 Demo complete!');
  console.log(`\nTo inspect the repositories:`);
  console.log(`  cd ${repoPath} && git log --oneline`);
  console.log(`  cd ${forkPath} && git log --oneline`);
  console.log(`\nRepository files:`);
  console.log(`  ls -la ${repoPath}`);
  console.log(`  cat ${repoPath}/lyrics.md`);
  console.log(`  cat ${repoPath}/metadata.json | jq .`);
}

async function showGitStatus(repoPath: string, title: string) {
  console.log(`\n  📋 ${title}:`);

  try {
    // Show git log
    const { execSync } = await import('child_process');
    const gitLog = execSync('git log --oneline -5', {
      cwd: repoPath,
      encoding: 'utf8'
    }).trim();

    console.log('     Git History:');
    gitLog.split('\n').forEach(line => {
      console.log(`       ${line}`);
    });

    // Show git status
    const gitStatus = execSync('git status --porcelain', {
      cwd: repoPath,
      encoding: 'utf8'
    }).trim();

    if (gitStatus) {
      console.log('     Git Status:');
      gitStatus.split('\n').forEach(line => {
        console.log(`       ${line}`);
      });
    } else {
      console.log('     Git Status: Clean working directory');
    }

  } catch (error) {
    console.log(`     Error getting git status: ${error}`);
  }
}

async function showRepositorySummary(repository: SongRepository, repoPath: string) {
  const entity = await repository.getLatest();
  const stats = repository.getStatistics(entity.content);

  console.log(`   Repository Path: ${repoPath}`);
  console.log(`   Repository ID: ${entity.repositoryId}`);
  console.log(`   Current Revision: ${entity.revisionId}`);
  console.log(`   Song Title: ${entity.metadata.title}`);
  console.log(`   Genre: ${entity.metadata.genre}`);
  console.log(`   BPM: ${entity.metadata.bpm}`);
  console.log(`   Key: ${entity.metadata.key}`);
  console.log(`   Tags: ${entity.metadata.tags.join(', ')}`);
  console.log(`   Statistics:`);
  console.log(`     - Sections: ${stats.sectionCount}`);
  console.log(`     - Total Lines: ${stats.totalLines}`);
  console.log(`     - Total Words: ${stats.totalWords}`);
  console.log(`     - Avg Words/Section: ${stats.averageWordsPerSection}`);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const repoPath = args[0] || path.join(process.cwd(), 'demo-song-repo');

  try {
    await runDemo(repoPath);
  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

// Run if this is the main module
main();
