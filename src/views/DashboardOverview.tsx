/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Users, FileText, Landmark, Clock, AlertCircle, Sparkles, 
  CheckSquare, TrendingUp, Award, ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import { store } from '../dataStore';
import { Role } from '../types';

interface DashboardOverviewProps {
  role: Role;
}

export default function DashboardOverview({ role }: DashboardOverviewProps) {
  const attendees = store.getAttendees();
  const speakers = store.getSpeakers();
  const finance = store.getFinance();
  const tasks = store.getTasks();
  const sponsors = store.getSponsors();
  const logs = store.getNotificationLogs();

  // Calculation Metrics
  const totalAttendees = attendees.length;
  const verifiedPaidAttendees = attendees.filter(a => a.paymentStatus === 'paid').length;
  const checkedInCount = attendees.filter(a => a.isCheckedIn).length;
  const checkInRate = totalAttendees > 0 ? Math.round((checkedInCount / totalAttendees) * 100) : 0;

  const totalSpeakers = speakers.length;
  const approvedSpeakers = speakers.filter(s => s.status === 'approved').length;
  const pendingSpeakers = speakers.filter(s => s.status === 'pending').length;

  const totalIncome = finance.filter(f => f.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = finance.filter(f => f.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const netFunding = totalIncome - totalExpense;

  const tasksDone = tasks.filter(t => t.status === 'done').length;
  const totalTasksCount = tasks.length;
  const taskProgressPct = totalTasksCount > 0 ? Math.round((tasksDone / totalTasksCount) * 100) : 0;

  // Alerts needing verification
  const pendingDelegatesToVerify = attendees.filter(a => a.paymentStatus === 'pending_verification');

  // SVG Chart Computations for delegate packages
  const standardCount = attendees.filter(a => a.packageId === 'pkg-standard').length;
  const vipCount = attendees.filter(a => a.packageId === 'pkg-vip').length;
  const onlineCount = attendees.filter(a => a.packageId === 'pkg-online').length;
  const maxVal = Math.max(standardCount, vipCount, onlineCount, 1);

  // Dynamic Period Registration Speeds for Charting
  const getRegByPeriod = (startDay: number, endDay: number, month: number = 5) => {
    return attendees.filter(a => {
      if (!a.registrationDate) return false;
      const parts = a.registrationDate.split('-');
      if (parts.length < 3) return false;
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      return m === month && d >= startDay && d <= endDay;
    }).length;
  };

  const getRegInJune = () => {
    return attendees.filter(a => {
      if (!a.registrationDate) return false;
      const parts = a.registrationDate.split('-');
      if (parts.length < 3) return false;
      const m = parseInt(parts[1], 10);
      return m >= 6;
    }).length;
  };

  const period1 = getRegByPeriod(1, 10); // Tuần 1: 1-10 tháng 5
  const period2 = getRegByPeriod(11, 20); // Tuần 2: 11-20 tháng 5
  const period3 = getRegByPeriod(21, 31); // Tuần 3: 21-31 tháng 5
  const periodJune = getRegInJune(); // Hiện tại (Tháng 6 trở đi)
  const maxPeriodVal = Math.max(period1, period2, period3, periodJune, 1);

  const h1 = Math.max(Math.round((period1 / maxPeriodVal) * 80), 8);
  const h2 = Math.max(Math.round((period2 / maxPeriodVal) * 80), 8);
  const h3 = Math.max(Math.round((period3 / maxPeriodVal) * 80), 8);
  const h4 = Math.max(Math.round((periodJune / maxPeriodVal) * 80), 8);

  const totalCommittedSponsor = sponsors.reduce((acc, curr) => acc + (curr.pledgedAmount || 0), 0);
  const totalPaidSponsor = sponsors.reduce((acc, curr) => acc + (curr.paidAmount || 0), 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Alert Banner if action is needed */}
      {pendingDelegatesToVerify.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between text-amber-900 text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 animate-bounce" />
            <span className="font-semibold">
              Hành động khẩn cấp: Có {pendingDelegatesToVerify.length} đại biểu đang đợi kiểm chứng thanh toán chuyển khoản trước khi phát hành Thẻ vé điện tử & mã QR!
            </span>
          </div>
          <p className="text-[10px] text-slate-500 italic hidden lg:block">Kiểm tra phân hệ Đối soát tài chính để duyệt.</p>
        </div>
      )}

      {/* Stat Cards - Grid Arrangement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1: Revenue */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between hover:border-slate-350 transition-all">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">DOANH THU THUẦN</p>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Landmark className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-900 font-mono">{(netFunding).toLocaleString()}đ</h3>
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
                <ArrowUpRight className="w-3 h-3" />
                Tổng thu: {(totalIncome).toLocaleString()}đ
              </p>
            </div>
            <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded uppercase font-mono tracking-wider">REAL-TIME</span>
          </div>
        </div>

        {/* Metric 2: Attendees */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between hover:border-slate-350 transition-all">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">NGƯỜI THAM DỰ</p>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-900 font-mono">{totalAttendees} Người</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                Đã duyệt phí: <strong className="text-slate-700 font-bold">{verifiedPaidAttendees}</strong>
              </p>
            </div>
            <span className="text-[10px] text-emerald-600 font-black bg-emerald-50 px-2 py-0.5 rounded">+12%</span>
          </div>
        </div>

        {/* Metric 3: Speakers/Presentations */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between hover:border-slate-350 transition-all">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">BÁO CÁO VIÊN</p>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-900 font-mono">{totalSpeakers} Đề Tài</h3>
              <p className="text-[10px] text-indigo-500 font-semibold mt-0.5">
                Đã duyệt: {approvedSpeakers} / {totalSpeakers}
              </p>
            </div>
            <span className="text-[10px] text-slate-400 font-medium italic">Đang chờ: {pendingSpeakers}</span>
          </div>
        </div>

        {/* Metric 4: Internal Operations */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between hover:border-slate-350 transition-all">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">CÔNG VIỆC NỘI BỘ</p>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <CheckSquare className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div className="flex-1 mr-4">
              <h3 className="text-2xl font-black text-slate-900 font-mono">{taskProgressPct}%</h3>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div className="h-full bg-amber-400" style={{ width: `${taskProgressPct}%` }} />
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-semibold font-mono shrink-0">{tasksDone}/{totalTasksCount} DONE</span>
          </div>
        </div>

      </div>

      {/* Analytical Visual Flow Section - 12 Columns Grid */}
      <div className="grid grid-cols-12 gap-6">

        {/* Financial Flow Vector Chart (Left: 8 columns) */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Dòng tiền & Đối soát tài chính</h4>
              <p className="text-[10px] text-slate-400 font-medium">Đối chiếu tỷ lệ nguồn thu - dự kiến chi theo thời gian thực</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-sm"></div>
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">DOANH THU THUẦN</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-slate-300 rounded-sm"></div>
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">TỔNG CHI</span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5 flex-1 flex flex-col justify-center">
            {/* Visual breakdown for Income */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Khoản Thu lũy kế (Phí đại biểu & Nhà tài trợ đóng góp)</span>
                <span className="font-mono text-indigo-600">{(totalIncome).toLocaleString()}đ</span>
              </div>
              <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex">
                <div className="bg-indigo-600 h-full hover:opacity-90 transition-all" style={{ width: '82%' }} title="Đại biểu VIP & Standard" />
                <div className="bg-indigo-400 h-full hover:opacity-90 transition-all" style={{ width: '18%' }} title="Đại biểu Online & Khác" />
              </div>
              <span className="text-[9px] text-slate-400 block mt-1 leading-snug">Gói VIP & Tài trợ Gold đóng góp chính (82%) | Phí đại biểu Tiêu chuẩn & Gói Online bổ trợ (18%)</span>
            </div>

            {/* Visual breakdown for Expenses */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Khoản Chi lũy kế (Sảnh họp, gala dinner, in ấn ấn phẩm, teabreak)</span>
                <span className="font-mono text-slate-600">{(totalExpense).toLocaleString()}đ</span>
              </div>
              <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex">
                <div className="bg-slate-500 h-full hover:opacity-90 transition-all" style={{ width: '70%' }} title="Chi phí hạ tầng thuê sảnh" />
                <div className="bg-slate-350 h-full hover:opacity-90 transition-all" style={{ width: '30%' }} title="In hóa đơn, CME, Teabreak" />
              </div>
              <span className="text-[9px] text-slate-400 block mt-1 leading-snug">Sảnh họp & Đêm Gala (70%) | Teabreak, thẻ đeo, CME (30%)</span>
            </div>

            {/* Timeline Growth columns simulation */}
            <div className="pt-4 border-t border-slate-100 mt-4">
              <p className="text-xs font-bold text-slate-700 mb-4 uppercase tracking-wide">Tốc độ đăng ký trực tuyến (Số lượng / Tuần):</p>
              <div className="flex items-end justify-between h-24 bg-slate-50/50 rounded-xl px-10 py-3 border border-slate-150 relative">
                <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none opacity-30">
                  <div className="border-b border-dashed border-slate-300 w-full" />
                  <div className="border-b border-dashed border-slate-300 w-full" />
                </div>

                <div className="flex flex-col items-center gap-1.5 relative z-10 w-16">
                  <span className="font-mono text-[9px] text-indigo-650 font-bold">{period1} ĐB</span>
                  <div className="w-8 bg-indigo-500/20 border-t-2 border-indigo-500 rounded-t hover:bg-indigo-500 transition-all" style={{ height: `${h1}px` }} />
                  <span className="font-mono text-[9px] text-slate-400">1-10/5</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 relative z-10 w-16">
                  <span className="font-mono text-[9px] text-indigo-650 font-bold">{period2} ĐB</span>
                  <div className="w-8 bg-indigo-500/20 border-t-2 border-indigo-500 rounded-t hover:bg-indigo-500 transition-all" style={{ height: `${h2}px` }} />
                  <span className="font-mono text-[9px] text-slate-400">11-20/5</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 relative z-10 w-16">
                  <span className="font-mono text-[9px] text-indigo-650 font-bold">{period3} ĐB</span>
                  <div className="w-8 bg-indigo-500/20 border-t-2 border-indigo-500 rounded-t hover:bg-indigo-500 transition-all" style={{ height: `${h3}px` }} />
                  <span className="font-mono text-[9px] text-slate-400">21-31/5</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 relative z-10 w-16">
                  <span className="font-sans text-[9px] text-emerald-650 font-extrabold">{periodJune} ĐB</span>
                  <div className="w-8 bg-emerald-605 border-t-2 border-emerald-600 rounded-t shadow-sm animate-pulse" style={{ height: `${h4}px` }} />
                  <span className="font-sans font-bold text-[9px] text-emerald-600">Hiện tại</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 border-t border-slate-100 bg-slate-50/30 flex justify-around text-[9px] font-bold text-slate-400 uppercase tracking-widest rounded-b-xl">
            <span>Tuần khởi động</span>
            <span>Tuần truyền thông 1</span>
            <span>Tuần truyền thông 2</span>
            <span>Giai đoạn nước rút (Tháng 6+)</span>
          </div>
        </div>


        {/* Recent Automated Communications Feed (Right: 4 columns) */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col font-sans">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-xl flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Thông báo tự động</h4>
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[9.5px] font-bold uppercase tracking-wider">Hệ Thống Gần Để</span>
          </div>

          <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[420px]">
            {logs.length === 0 ? (
              <div className="space-y-4">
                {/* Fallback illustrative logs for design preservation */}
                <div className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors opacity-80">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-850">Đăng ký thành công (Mẫu)</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono leading-relaxed">Gửi Zalo ZNS cho: BS. Hoàng Văn Minh (ATT-001)</p>
                    <span className="text-[9px] text-slate-355 block mt-1">Lịch sử hệ thống</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors opacity-80">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-mono font-bold text-xs">
                    ✉
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-850">Duyệt bài báo khoa học (Mẫu)</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono leading-relaxed">Gửi Email kèm tài liệu đến PGS.TS. Trần Quốc Bảo</p>
                    <span className="text-[9px] text-slate-355 block mt-1">Lịch sử hệ thống</span>
                  </div>
                </div>
                <div className="p-3 bg-indigo-50/40 border border-dashed border-indigo-150 rounded-xl text-center">
                  <p className="text-[10px] text-indigo-655 font-bold leading-relaxed">Phiên này chưa phát sinh thông báo mới!</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">ZNS và Email sẽ tự động gửi khi bạn phê duyệt thanh toán chuyển khoản đại biểu.</p>
                </div>
              </div>
            ) : (
              logs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-100 hover:border-indigo-300 transition-all shadow-xs">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                    log.type === 'zalo' ? 'bg-sky-50 text-sky-600' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {log.type === 'zalo' ? 'Z' : '✉'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate">{log.templateName}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-mono truncate leading-normal">
                      {log.type === 'zalo' ? 'Zalo ZNS' : 'Email'}: {log.recipient}
                    </p>
                    <span className="text-[9px] text-slate-404 block mt-1 font-mono">{log.sentAt}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Bottom Row - 3 Quick Cards resembling the requested layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Quick Card 1: Internal Task Breakdown */}
        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-md border border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] font-black uppercase text-indigo-300 tracking-wider mb-4">MỤC TIÊU VẬN HÀNH</h4>
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-200">Khao sảnh & Setup Booth</span>
                <span className="text-[9px] font-bold bg-slate-800 text-indigo-300 px-2 py-0.5 rounded border border-slate-700 font-mono">CTV TEAM</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-200">In ấn Thẻ đại biểu, Tài liệu</span>
                <span className="text-[9px] font-bold bg-slate-800 text-amber-300 px-2 py-0.5 rounded border border-slate-700 font-mono">SẢN XUẤT</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-200">Kiểm tra cổng API Zalo/Email</span>
                <span className="text-[9px] font-bold bg-slate-800 text-emerald-300 px-2 py-0.5 rounded border border-slate-700 font-mono">ADMIN AD</span>
              </div>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-800 flex justify-between items-center text-[10px] font-semibold text-slate-400">
            <span>Tổng số {totalTasksCount} công việc</span>
            <span className="text-indigo-400 hover:underline cursor-pointer flex items-center gap-0.5">
              Chi tiết công việc →
            </span>
          </div>
        </div>

        {/* Quick Card 2: Sponsor summary */}
        <div className="bg-indigo-600 text-white p-6 rounded-xl shadow-md border border-indigo-500 flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] font-black uppercase text-indigo-200 tracking-wider mb-4">QUẢN LÝ NHÀ TÀI TRỢ</h4>
            <p className="text-xs text-indigo-100 mb-6 leading-relaxed">Đồng hành của doanh nghiệp dược phẩm, thiết bị y khoa hỗ trợ lớn nhất cho công tác tổ chức hội nghị.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-500/60 p-3 rounded-lg border border-indigo-400/40 text-center shadow-sm">
                <p className="text-sm font-bold font-mono">{(totalCommittedSponsor / 1000000).toFixed(0)}Mđ</p>
                <p className="text-[9px] opacity-80 mt-0.5">Cam kết tài trợ</p>
              </div>
              <div className="bg-indigo-500/60 p-3 rounded-lg border border-indigo-400/40 text-center shadow-sm">
                <p className="text-sm font-bold font-mono">{(totalPaidSponsor / 1000000).toFixed(0)}Mđ</p>
                <p className="text-[9px] opacity-80 mt-0.5">Đã giải ngân ({Math.round((totalPaidSponsor / Math.max(totalCommittedSponsor, 1)) * 100)}%)</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-2">
            <div className="w-full bg-indigo-700 text-indigo-100 text-[10px] font-bold py-2 rounded-lg text-center uppercase tracking-wider block border border-indigo-450">
              Đối soát tài trợ thời gian thực
            </div>
          </div>
        </div>

        {/* Quick Card 3: Roles and Access layout */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">PHẦN QUYỀN & VAI TRÒ</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded border border-slate-100">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex-1">Ban Tổ Chức (BTC)</span>
                <span className="text-[9px] text-slate-400 font-mono font-bold">2 Account</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded border border-slate-100">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex-1">Cộng Tác Viên (CTV)</span>
                <span className="text-[9px] text-slate-400 font-mono font-bold">4 Account</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded border border-slate-100">
                <div className="w-2 h-2 rounded-full bg-teal-500" />
                <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex-1">Tổng quản trị (Admin)</span>
                <span className="text-[9px] text-slate-400 font-mono font-bold">1 Account</span>
              </div>
            </div>
          </div>
          <div className="pt-2 text-center">
            <span className="text-[10px] font-black text-indigo-600 hover:underline uppercase block tracking-wider">
              An toàn bảo mật & Phân quyền chủ động
            </span>
          </div>
        </div>

      </div>

      {/* Segment Distribution Ratios Visuals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-2">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center text-xs font-bold mb-1.5">
              <span className="text-slate-600">Phân khúc: GÓI ĐẠI BIỂU VIP</span>
              <span className="font-mono text-slate-900 font-black">{vipCount} ({Math.round((vipCount/maxVal)*100) || 0}%)</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${(vipCount/maxVal)*100}%` }} />
            </div>
          </div>
          <span className="text-[9px] text-slate-400 block mt-2 leading-snug">Gói quyền lợi cao cấp tham dự Gala Dinner và sảnh đón VIP.</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center text-xs font-bold mb-1.5">
              <span className="text-slate-600">Phân khúc: GÓI TIÊU CHUẨN</span>
              <span className="font-mono text-slate-900 font-black">{standardCount} ({Math.round((standardCount/maxVal)*100) || 0}%)</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-indigo-650 h-full rounded-full transition-all" style={{ width: `${(standardCount/maxVal)*100}%` }} />
            </div>
          </div>
          <span className="text-[9px] text-slate-400 block mt-2 leading-snug">Tham dự toàn văn hội nghị trực tiếp kèm tài liệu chuyên san.</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center text-xs font-bold mb-1.5">
              <span className="text-slate-600">Phân khúc: GÓI TRỰC TUYẾN (ONLINE)</span>
              <span className="font-mono text-slate-900 font-black">{onlineCount} ({Math.round((onlineCount/maxVal)*100) || 0}%)</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-sky-500 h-full rounded-full transition-all" style={{ width: `${(onlineCount/maxVal)*100}%` }} />
            </div>
          </div>
          <span className="text-[9px] text-slate-400 block mt-2 leading-snug">Truy cập không giới hạn luồng phát sóng, cấp CME số hóa.</span>
        </div>
      </div>

      {/* Attendees & Registration Activity Logs Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
          <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider">Nhật Ký Đăng Ký Hệ Thống Gần Đây</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-500">
            <thead className="text-[9px] text-slate-400 bg-slate-50 uppercase tracking-widest font-mono">
              <tr>
                <th className="px-5 py-3">Mốc Thời Gian</th>
                <th className="px-5 py-3">Đối Tượng</th>
                <th className="px-5 py-3">Đơn Vị Công Tác</th>
                <th className="px-5 py-3">Hình Thức</th>
                <th className="px-5 py-3">Phát Tín Mail & Zalo OA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 font-medium">
              {attendees.slice(0, 3).map((att) => (
                <tr key={att.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-slate-400">{att.registrationDate}</td>
                  <td className="px-5 py-3.5 font-bold text-slate-900">
                    {att.title} {att.fullName}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 font-semibold">{att.organization}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700/80 rounded font-bold text-[10px]">Đại Biểu</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[9px]">
                      <Sparkles className="w-3 h-3 text-emerald-500 shrink-0" />
                      Email & Zalo OK
                    </span>
                  </td>
                </tr>
              ))}
              {speakers.slice(0, 2).map((spk) => (
                <tr key={spk.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-slate-400">{spk.registrationDate}</td>
                  <td className="px-5 py-3.5 font-bold text-slate-900">
                    {spk.title} {spk.fullName}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 font-semibold">{spk.organization}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-bold text-[10px]">Báo Cáo Viên</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-bold text-[9px]">
                      Abstract Saved
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
