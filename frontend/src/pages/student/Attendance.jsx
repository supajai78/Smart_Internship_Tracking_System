import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { MapPin, Clock, LogIn, LogOut, CheckCircle, Navigation, Satellite, Shield, AlertTriangle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const studentIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const companyIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

function FitBounds({ studentPos, companyPos }) {
    const map = useMap();
    useEffect(() => {
        if (studentPos && companyPos) {
            map.fitBounds(L.latLngBounds([studentPos, companyPos]), { padding: [50, 50] });
        } else if (studentPos) { map.setView(studentPos, 15); }
    }, [studentPos, companyPos, map]);
    return null;
}

export default function Attendance() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [myPos, setMyPos] = useState(null);
    const [gpsError, setGpsError] = useState(null);
    const [distance, setDistance] = useState(null);

    const fetchData = () => {
        api.get('/student/attendance').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
    };
    useEffect(() => { fetchData(); getLocation(); }, []);

    const getLocation = () => {
        if (!navigator.geolocation) { setGpsError('เบราว์เซอร์ไม่รองรับ GPS'); return; }
        navigator.geolocation.getCurrentPosition(
            (pos) => { setMyPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGpsError(null); },
            (err) => { setGpsError('ไม่สามารถระบุตำแหน่งได้: ' + err.message); },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    useEffect(() => {
        if (myPos && data?.company?.latitude && data?.company?.longitude) {
            const d = calcDistance(myPos.lat, myPos.lng, data.company.latitude, data.company.longitude);
            setDistance(Math.round(d));
        }
    }, [myPos, data]);

    function calcDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3;
        const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180, Δλ = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    const doAction = async (action) => {
        setActionLoading(true);
        try {
            const pos = await new Promise((resolve) => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(p => resolve(p.coords), () => resolve({ latitude: 0, longitude: 0 }));
                } else { resolve({ latitude: 0, longitude: 0 }); }
            });
            const res = await api.post(`/student/attendance/${action}`, { latitude: pos.latitude, longitude: pos.longitude, method: 'gps' });
            if (res.data.success) { toast.success(res.data.message); fetchData(); setMyPos({ lat: pos.latitude, lng: pos.longitude }); }
            else { toast.error(res.data.message); }
        } catch { toast.error('เกิดข้อผิดพลาด'); }
        finally { setActionLoading(false); }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '3px solid #e2e8f0', borderTopColor: '#6d3ef2' }} />
        </div>
    );

    const today = data?.todayAttendance;
    const company = data?.company;
    const companyPos = company?.latitude && company?.longitude ? { lat: company.latitude, lng: company.longitude } : null;
    const checkInRadius = company?.checkInRadius || 500;
    const isInRange = distance !== null && distance <= checkInRadius;
    const mapCenter = myPos || companyPos || { lat: 15.2286, lng: 104.8564 };

    const statusBadge = (st) => {
        const styles = {
            present: { bg: '#ecfdf5', color: '#059669', label: 'เข้างาน' },
            late: { bg: '#fffbeb', color: '#d97706', label: 'สาย' },
            absent: { bg: '#fef2f2', color: '#dc2626', label: 'ขาด' },
            leave: { bg: '#eff6ff', color: '#2563eb', label: 'ลา' }
        };
        const s = styles[st] || { bg: '#f1f5f9', color: '#64748b', label: st };
        return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: s.bg, color: s.color }}>{s.label}</span>;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)' }}>
                        <Satellite className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-surface-900">ลงเวลาปฏิบัติงาน</h1>
                        <p className="text-surface-500 text-sm mt-0.5">{company?.name || 'ยังไม่ระบุสถานประกอบการ'}</p>
                    </div>
                </div>
                {distance !== null && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isInRange ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {isInRange ? <Shield className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        {isInRange ? 'อยู่ในระยะ' : 'นอกระยะ'} · {distance} ม.
                    </div>
                )}
            </div>

            {/* Map Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-surface-100 overflow-hidden hover:shadow-md transition-all">
                <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, rgba(109,62,242,0.03), rgba(34,211,238,0.03))' }}>
                    <h3 className="font-semibold text-surface-800 flex items-center gap-2">
                        <MapPin className="w-5 h-5" style={{ color: '#6d3ef2' }} />ตำแหน่งของคุณ
                    </h3>
                    <button onClick={getLocation} className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all hover:bg-primary-50" style={{ color: '#6d3ef2' }}>
                        <Navigation className="w-4 h-4" />รีเฟรช GPS
                    </button>
                </div>

                {gpsError ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <MapPin className="w-8 h-8 text-red-400" />
                        </div>
                        <p className="text-surface-600 text-sm mb-3">{gpsError}</p>
                        <button onClick={getLocation} className="text-sm font-medium px-4 py-2 rounded-xl transition-all hover:bg-primary-50" style={{ color: '#6d3ef2' }}>ลองใหม่</button>
                    </div>
                ) : (
                    <div style={{ height: '380px' }}>
                        <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
                            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            {myPos && (
                                <Marker position={[myPos.lat, myPos.lng]} icon={studentIcon}>
                                    <Popup><strong>📍 ตำแหน่งของคุณ</strong><br />{myPos.lat.toFixed(6)}, {myPos.lng.toFixed(6)}{distance !== null && <><br />ห่าง: {distance} เมตร</>}</Popup>
                                </Marker>
                            )}
                            {companyPos && (
                                <>
                                    <Marker position={[companyPos.lat, companyPos.lng]} icon={companyIcon}>
                                        <Popup><strong>🏢 {company?.name}</strong><br />{company?.address}<br />รัศมี: {checkInRadius} เมตร</Popup>
                                    </Marker>
                                    <Circle center={[companyPos.lat, companyPos.lng]} radius={checkInRadius}
                                        pathOptions={{ color: '#6d3ef2', fillColor: '#6d3ef2', fillOpacity: 0.06, weight: 2, dashArray: '8, 6' }} />
                                </>
                            )}
                            <FitBounds studentPos={myPos ? [myPos.lat, myPos.lng] : null} companyPos={companyPos ? [companyPos.lat, companyPos.lng] : null} />
                        </MapContainer>
                    </div>
                )}
            </div>

            {/* Today Status Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-6 hover:shadow-md transition-all">
                <h3 className="font-semibold text-surface-800 mb-5 flex items-center gap-2">
                    <Clock className="w-5 h-5" style={{ color: '#6d3ef2' }} />สถานะวันนี้
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="rounded-xl p-4 text-center border border-surface-100 hover:border-emerald-200 transition-colors" style={{ background: 'rgba(16,185,129,0.04)' }}>
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                            <LogIn className="w-5 h-5 text-emerald-600" />
                        </div>
                        <p className="text-xs text-surface-400 mb-1">เวลาเข้างาน</p>
                        <p className="text-xl font-bold text-surface-800">{today?.checkInTime ? new Date(today.checkInTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</p>
                    </div>
                    <div className="rounded-xl p-4 text-center border border-surface-100 hover:border-red-200 transition-colors" style={{ background: 'rgba(239,68,68,0.04)' }}>
                        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                            <LogOut className="w-5 h-5 text-red-500" />
                        </div>
                        <p className="text-xs text-surface-400 mb-1">เวลาออกงาน</p>
                        <p className="text-xl font-bold text-surface-800">{today?.checkOutTime ? new Date(today.checkOutTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</p>
                    </div>
                    <div className="rounded-xl p-4 text-center border border-surface-100 hover:border-primary-200 transition-colors" style={{ background: 'rgba(109,62,242,0.04)' }}>
                        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                            <CheckCircle className="w-5 h-5 text-primary-600" />
                        </div>
                        <p className="text-xs text-surface-400 mb-1">สถานะ</p>
                        <div className="mt-1">{today ? statusBadge(today.status) : <span className="text-surface-400 text-sm">ยังไม่ลงเวลา</span>}</div>
                    </div>
                </div>

                <div className="flex gap-3">
                    {!today?.checkInTime && (
                        <button onClick={() => doAction('checkin')} disabled={actionLoading}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 text-white rounded-xl transition-all text-sm font-semibold disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
                            style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}>
                            {actionLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogIn className="w-5 h-5" />ลงเวลาเข้างาน</>}
                        </button>
                    )}
                    {today?.checkInTime && !today?.checkOutTime && (
                        <button onClick={() => doAction('checkout')} disabled={actionLoading}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 text-white rounded-xl transition-all text-sm font-semibold disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
                            style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)', boxShadow: '0 4px 15px rgba(239,68,68,0.3)' }}>
                            {actionLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogOut className="w-5 h-5" />ลงเวลาออกงาน</>}
                        </button>
                    )}
                    {today?.checkInTime && today?.checkOutTime && (
                        <div className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold">
                            <CheckCircle className="w-5 h-5" />ลงเวลาครบแล้ว ✓
                        </div>
                    )}
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-surface-100 overflow-hidden hover:shadow-md transition-all">
                <div className="px-6 py-4 border-b border-surface-100" style={{ background: 'linear-gradient(135deg, rgba(109,62,242,0.03), rgba(34,211,238,0.03))' }}>
                    <h3 className="font-semibold text-surface-800">📅 ประวัติการลงเวลา (30 วันล่าสุด)</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead><tr className="border-b border-surface-100 bg-surface-50/50">
                            <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">วันที่</th>
                            <th className="text-center px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">เข้างาน</th>
                            <th className="text-center px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">ออกงาน</th>
                            <th className="text-center px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">สถานะ</th>
                        </tr></thead>
                        <tbody>
                            {(data?.attendanceHistory || []).map((a, i) => (
                                <tr key={i} className="border-b border-surface-50 hover:bg-primary-50/30 transition-colors">
                                    <td className="px-6 py-3.5 text-sm font-medium text-surface-700">{new Date(a.date).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                                    <td className="px-6 py-3.5 text-sm text-center text-surface-600">{a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                    <td className="px-6 py-3.5 text-sm text-center text-surface-600">{a.checkOutTime ? new Date(a.checkOutTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                    <td className="px-6 py-3.5 text-center">{statusBadge(a.status)}</td>
                                </tr>
                            ))}
                            {(data?.attendanceHistory || []).length === 0 && (
                                <tr><td colSpan={4} className="text-center py-12 text-surface-400 text-sm">ยังไม่มีข้อมูลการลงเวลา</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
