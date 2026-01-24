import { useState, useMemo } from 'react';
import { DashboardPage } from '@devbooks/components';
import { Button } from '@devbooks/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@devbooks/ui';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CalendarPlus,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isWithinInterval,
} from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn } from '@devbooks/ui';

// Mock leave data - replace with actual data from API/state management
const mockLeaves = [
  {
    id: 1,
    employeeName: 'John Doe',
    startDate: new Date(2026, 0, 13),
    endDate: new Date(2026, 0, 15),
    type: 'Sick Leave',
    status: 'approved' as const,
    color: 'bg-red-500',
  },
  {
    id: 2,
    employeeName: 'Jane Smith',
    startDate: new Date(2026, 0, 20),
    endDate: new Date(2026, 0, 24),
    type: 'Vacation',
    status: 'approved' as const,
    color: 'bg-blue-500',
  },
  {
    id: 3,
    employeeName: 'Ahmed Khan',
    startDate: new Date(2026, 0, 8),
    endDate: new Date(2026, 0, 10),
    type: 'Personal',
    status: 'pending' as const,
    color: 'bg-purple-500',
  },
  {
    id: 4,
    employeeName: 'Sarah Ali',
    startDate: new Date(2026, 0, 27),
    endDate: new Date(2026, 0, 30),
    type: 'Vacation',
    status: 'approved' as const,
    color: 'bg-emerald-500',
  },
  {
    id: 5,
    employeeName: 'Michael Brown',
    startDate: new Date(2026, 0, 15),
    endDate: new Date(2026, 0, 16),
    type: 'Emergency',
    status: 'approved' as const,
    color: 'bg-orange-500',
  },
  {
    id: 6,
    employeeName: 'Emily Johnson',
    startDate: new Date(2026, 1, 3),
    endDate: new Date(2026, 1, 7),
    type: 'Vacation',
    status: 'pending' as const,
    color: 'bg-pink-500',
  },
];

type Leave = (typeof mockLeaves)[number];

// Get leaves that overlap with a specific date
const getLeavesForDate = (date: Date, leaves: Leave[]) => {
  return leaves.filter((leave) => {
    return isWithinInterval(date, {
      start: leave.startDate,
      end: leave.endDate,
    });
  });
};

const Leaves = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  // Get leaves for selected date
  const selectedDateLeaves = selectedDate
    ? getLeavesForDate(selectedDate, mockLeaves)
    : [];

  // Upcoming leaves (next 30 days)
  const upcomingLeaves = useMemo(() => {
    const today = new Date();
    return mockLeaves
      .filter(
        (leave) =>
          leave.startDate >= today ||
          isWithinInterval(today, {
            start: leave.startDate,
            end: leave.endDate,
          }),
      )
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, 5);
  }, []);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <DashboardPage
      icon={CalendarIcon}
      title="Leaves"
      description="Manage leave requests and approvals"
    >
      <div className="space-y-6">
        {/* Header with navigation and add button */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="min-w-[200px] text-center text-xl font-semibold">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              Today
            </Button>
          </div>
          <Button onClick={() => navigate('/leaves/add')} variant="gradient">
            <CalendarPlus className="mr-2 h-4 w-4" />
            Request Leave
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
          {/* Calendar Grid */}
          <div className="xl:col-span-3">
            <Card>
              <CardContent className="p-0">
                {/* Week day headers */}
                <div className="grid grid-cols-7 border-b bg-muted/50">
                  {weekDays.map((day) => (
                    <div
                      key={day}
                      className="px-2 py-3 text-center text-sm font-semibold text-muted-foreground"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7">
                  {calendarDays.map((day, index) => {
                    const dayLeaves = getLeavesForDate(day, mockLeaves);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isToday = isSameDay(day, new Date());
                    const isSelected =
                      selectedDate && isSameDay(day, selectedDate);

                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedDate(day)}
                        className={cn(
                          'min-h-[100px] cursor-pointer border-b border-r p-1 transition-colors hover:bg-muted/50',
                          !isCurrentMonth &&
                            'bg-muted/20 text-muted-foreground',
                          isSelected && 'ring-2 ring-inset ring-primary',
                          index % 7 === 6 && 'border-r-0',
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <span
                            className={cn(
                              'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm',
                              isToday &&
                                'bg-primary font-semibold text-primary-foreground',
                              !isToday && isCurrentMonth && 'font-medium',
                            )}
                          >
                            {format(day, 'd')}
                          </span>
                          {dayLeaves.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {dayLeaves.length}
                            </span>
                          )}
                        </div>

                        {/* Leave indicators */}
                        <div className="mt-1 space-y-1">
                          {dayLeaves.slice(0, 3).map((leave) => (
                            <div
                              key={leave.id}
                              className={cn(
                                'truncate rounded px-1 py-0.5 text-xs text-white',
                                leave.color,
                                leave.status === 'pending' && 'opacity-60',
                              )}
                              title={`${leave.employeeName} - ${leave.type}`}
                            >
                              {leave.employeeName.split(' ')[0]}
                            </div>
                          ))}
                          {dayLeaves.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayLeaves.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Date Details */}
            {selectedDate && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {format(selectedDate, 'EEEE, MMMM d')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDateLeaves.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDateLeaves.map((leave) => (
                        <div
                          key={leave.id}
                          className="flex items-start gap-3 rounded-lg border p-3"
                        >
                          <div
                            className={cn(
                              'mt-0.5 h-3 w-3 shrink-0 rounded-full',
                              leave.color,
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium leading-tight">
                              {leave.employeeName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {leave.type}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {format(leave.startDate, 'MMM d')} -{' '}
                              {format(leave.endDate, 'MMM d')}
                            </p>
                            <span
                              className={cn(
                                'mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                leave.status === 'approved'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700',
                              )}
                            >
                              {leave.status.charAt(0).toUpperCase() +
                                leave.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No leaves scheduled for this date.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Upcoming Leaves */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Upcoming Leaves</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingLeaves.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingLeaves.map((leave) => (
                      <div key={leave.id} className="flex items-start gap-3">
                        <div
                          className={cn(
                            'mt-1 h-2 w-2 shrink-0 rounded-full',
                            leave.color,
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-tight">
                            {leave.employeeName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(leave.startDate, 'MMM d')} -{' '}
                            {format(leave.endDate, 'MMM d')}
                          </p>
                        </div>
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-2 py-0.5 text-xs',
                            leave.status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700',
                          )}
                        >
                          {leave.status === 'approved' ? '✓' : '⏳'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No upcoming leaves.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from(
                    new Set(mockLeaves.map((l) => l.employeeName)),
                  ).map((name) => {
                    const leave = mockLeaves.find(
                      (l) => l.employeeName === name,
                    );
                    return (
                      <div key={name} className="flex items-center gap-2">
                        <div
                          className={cn(
                            'h-3 w-3 rounded-full',
                            leave?.color || 'bg-gray-400',
                          )}
                        />
                        <span className="text-sm">{name}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardPage>
  );
};

export default Leaves;
