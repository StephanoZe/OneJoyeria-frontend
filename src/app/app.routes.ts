import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { Login } from './components/login/login';
import { Layout } from './components/layout/layout';
import { Panel } from './components/panel/panel';
import { Inventario } from './components/inventario/inventario';
import { PiezaForm } from './components/pieza-form/pieza-form';
import { PiezaDetalle } from './components/pieza-detalle/pieza-detalle';
import { ProveedorList } from './components/proveedor-list/proveedor-list';
import { ProveedorForm } from './components/proveedor-form/proveedor-form';
import { ProveedorDetalle } from './components/proveedor-detalle/proveedor-detalle';
import { Alertas } from './components/alertas/alertas';
import { Reportes } from './components/reportes/reportes';
import { ReporteImprimir } from './components/reporte-imprimir/reporte-imprimir';

export const routes: Routes = [
  { path: 'login', component: Login, title: 'Iniciar sesión | One Joyería' },
  { path: 'reporte-imprimir', component: ReporteImprimir, canActivate: [authGuard] },
  {
    // Todas estas pantallas comparten la barra superior y piden sesión iniciada
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'panel', pathMatch: 'full' },
      { path: 'panel', component: Panel, title: 'Panel | One Joyería' },
      { path: 'inventario', component: Inventario, title: 'Inventario | One Joyería' },
      { path: 'inventario/nueva', component: PiezaForm, title: 'Registrar pieza | One Joyería' },
      { path: 'inventario/:codigo', component: PiezaDetalle, title: 'Pieza | One Joyería' },
      { path: 'inventario/:codigo/editar', component: PiezaForm, title: 'Editar pieza | One Joyería' },
      { path: 'proveedores', component: ProveedorList, title: 'Proveedores | One Joyería' },
      { path: 'proveedores/nuevo', component: ProveedorForm, title: 'Registrar proveedor | One Joyería' },
      { path: 'proveedores/:id', component: ProveedorDetalle, title: 'Proveedor | One Joyería' },
      { path: 'proveedores/:id/editar', component: ProveedorForm, title: 'Editar proveedor | One Joyería' },
      { path: 'alertas', component: Alertas, title: 'Alertas | One Joyería' },
      { path: 'reportes', component: Reportes, title: 'Reportes | One Joyería' },
    ],
  },
  { path: '**', redirectTo: 'panel' },
];
