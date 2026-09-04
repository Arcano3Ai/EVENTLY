/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { ReceptionLayout } from './components/layout/ReceptionLayout';
import { Login } from './pages/auth/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { TableMap } from './pages/admin/TableMap';
import { GuestList } from './pages/admin/GuestList';
import { SmartSeating } from './pages/admin/SmartSeating';
import { ReceptionPanel } from './pages/reception/ReceptionPanel';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/tables" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Admin/Host Routes */}
        <Route path="/admin" element={<MainLayout />}>
          <Route index element={<Navigate to="/admin/tables" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tables" element={<TableMap />} />
          <Route path="table-map" element={<Navigate to="/admin/tables" replace />} />
          <Route path="guests" element={<GuestList />} />
          <Route path="smart-seating" element={<SmartSeating />} />
        </Route>

        {/* Reception Mobile Flow */}
        <Route path="/reception" element={<ReceptionLayout />}>
          <Route index element={<ReceptionPanel />} />
        </Route>
      </Routes>
    </Router>
  );
}
