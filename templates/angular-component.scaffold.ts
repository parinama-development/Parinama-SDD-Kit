/**
 * Angular Component Scaffold — Axis Technologies (spec-kit v2.3.0)
 *
 * HOW TO USE
 * ----------
 * 1. Copy BOTH scaffold files to your component directory:
 *    - angular-component.scaffold.ts  → myname.component.ts
 *    - angular-component.scaffold.css → myname.component.css  ← required; never start CSS blank
 * 2. Rename `ScaffoldComponent` → your component class name.
 * 3. Remove sections not needed (e.g., delete form fields if no modal).
 * 4. Search for TODO comments and fill them in.
 *
 * RULES BAKED IN (do not remove without a good reason):
 *  ✓ OnDestroy + takeUntil — prevents memory leaks (constitution §9.2)
 *  ✓ errorMessage pattern — no alert() ever (constitution §9.2)
 *  ✓ No console.log — remove debug logs before commit (constitution §9.2)
 *  ✓ Separate loading flags — one per independent data section (constitution §9.2)
 *  ✓ Breadcrumb uses `path` key — not `url` (constitution §9.2)
 *  ✓ No ReactiveFormsModule — only imported if actually needed
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
// TODO: import product-specific service if needed (e.g., IntegrationHubService)

@Component({
  selector: 'app-scaffold', // TODO: rename selector
  templateUrl: './scaffold.component.html', // TODO: rename
  styleUrls: ['./scaffold.component.css']   // TODO: rename
})
export class ScaffoldComponent implements OnInit, OnDestroy {

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  private destroy$ = new Subject<void>();

  // ─── Role flags ───────────────────────────────────────────────────────────
  isAdmin = false;
  isSuperAdmin = false;

  // ─── Page state ───────────────────────────────────────────────────────────
  loading = true;           // initial full-page load
  // sectionLoading = false; // TODO: add one flag per independent section/tab

  // ─── Error state ──────────────────────────────────────────────────────────
  // One per logical area (list actions vs. modal create vs. modal edit).
  // Never use alert(). Display inline via *ngIf="errorMessage" banner.
  errorMessage = '';
  // createErrorMessage = '';
  // editErrorMessage = '';
  // deleteErrorMessage = '';

  // ─── Data ─────────────────────────────────────────────────────────────────
  items: any[] = []; // TODO: type properly

  // ─── Modal state ──────────────────────────────────────────────────────────
  showCreateModal = false;
  newItem = { name: '', description: '' }; // TODO: model shape

  showEditModal = false;
  editItem: any = {};
  selectedItem: any = null;

  // ─── Breadcrumb ───────────────────────────────────────────────────────────
  breadcrumbItems = [
    { label: 'Parent Section', path: '/parent' }, // TODO: update
    { label: 'This Page' }
  ];

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    // TODO: inject product-specific service if needed
  ) {}

  ngOnInit(): void {
    const user = this.auth.currentUser;
    if (!user?.userGroupId) {
      this.router.navigate(['/login']);
      return;
    }

    this.isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    this.isSuperAdmin = user.role === 'SUPER_ADMIN';

    this.loadItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Data loading ─────────────────────────────────────────────────────────

  loadItems(): void {
    const user = this.auth.currentUser;
    if (!user?.userGroupId) return;

    this.loading = true;
    this.api.getItems(/* TODO: params */)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any[]) => {
          this.items = data;
          this.loading = false;
        },
        error: (err: any) => {
          this.errorMessage = err?.error?.message || 'Failed to load items.';
          this.loading = false;
        }
      });
  }

  // ─── forEach loop subscriptions ───────────────────────────────────────────
  // CRITICAL: subscriptions inside forEach are independent of the component's
  // top-level destroy$ chain. Every inner subscribe must also pipe takeUntil.

  loadItemsPerGroup(groupIds: string[]): void {
    let pending = groupIds.length;
    if (pending === 0) { this.loading = false; return; }
    groupIds.forEach(id => {
      this.api.getItemsByGroup(id)
        .pipe(takeUntil(this.destroy$))   // <-- required on each inner subscription
        .subscribe({
          next: (data: any[]) => {
            this.items.push(...data);
            if (--pending === 0) this.loading = false;
          },
          error: (err: any) => {
            this.errorMessage = err?.error?.message || 'Failed to load items for one or more groups.';
            if (--pending === 0) this.loading = false;
          }
        });
    });
  }

  // ─── Create modal ─────────────────────────────────────────────────────────

  openCreateModal(): void {
    this.newItem = { name: '', description: '' }; // always reset before opening
    // this.createErrorMessage = '';
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.newItem = { name: '', description: '' };
  }

  createItem(): void {
    if (!this.newItem.name) return;
    const user = this.auth.currentUser;
    if (!user?.userGroupId) return;

    this.api.createItem(/* TODO: body */)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.items.push(data);
          this.closeCreateModal();
        },
        error: (err: any) => {
          // this.createErrorMessage = err?.error?.message || 'Failed to create item.';
          this.errorMessage = err?.error?.message || 'Failed to create item.';
        }
      });
  }

  // ─── Edit modal ───────────────────────────────────────────────────────────

  openEditModal(item: any): void {
    this.selectedItem = item;
    this.editItem = { name: item.name, description: item.description }; // always reset
    // this.editErrorMessage = '';
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editItem = {};
    this.selectedItem = null;
  }

  updateItem(): void {
    if (!this.editItem.name || !this.selectedItem?.id) return;

    this.api.updateItem(this.selectedItem.id, /* TODO: body */)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          const index = this.items.findIndex(i => i.id === this.selectedItem.id);
          if (index !== -1) this.items[index] = data;
          this.closeEditModal();
        },
        error: (err: any) => {
          // this.editErrorMessage = err?.error?.message || 'Failed to update item.';
          this.errorMessage = err?.error?.message || 'Failed to update item.';
        }
      });
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  deleteItem(item: any): void {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;

    // Capture ID before any async operation — selectedItem may be nulled elsewhere
    const itemId = item.id;

    this.api.deleteItem(itemId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.items = this.items.filter(i => i.id !== itemId);
          // this.deleteErrorMessage = '';
        },
        error: (err: any) => {
          // this.deleteErrorMessage = err?.error?.message || 'Failed to delete item.';
          this.errorMessage = err?.error?.message || 'Failed to delete item.';
        }
      });
  }
}
