"use client";

import React, { useState, useEffect } from "react";
import DayPicker from "@/components/DayPicker";
import TimeTracker from "@/components/TimeTracker";
import TimeEntryList from "@/components/TimeEntryList";
import { saveTimeEntries, loadTimeEntries } from "@/lib/timeEntryStorage";
import { TimeEntry } from "@/types/TimeEntry";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ArrowDown, ChevronDown, PlusCircle } from "lucide-react";
import TimeTrackerSummary from "@/components/TimeTrackerSummary";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import DailyCalendarView from "@/components/DailyCalendarView";
import { WeekView } from "@/components/weekly/Calendar";
import CategoryEditor from "@/components/category/CategoryEditor";
import DailyBreakdown from "@/components/category/DailyBreakdown";

type Category = {
    name: string;
    color: string;
};

const DashboardPage = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState<
        { start: Date; end: Date } | undefined
    >(undefined);
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const today = new Date();

    const isToday = selectedDate.toDateString() === today.toDateString();
    useEffect(() => {
        setIsLoading(true);
        setTimeEntries((prevEntries) => {
            const storedTimeEntries = loadTimeEntries();
            setIsLoading(false);
            return storedTimeEntries.length > 0
                ? storedTimeEntries
                : prevEntries;
        });
    }, []);

    useEffect(() => {
        saveTimeEntries(timeEntries);
    }, [timeEntries]);

    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            setSelectedDate(date);
        }
    };

    const handleAddTimeEntry = (entry: TimeEntry) => {
        setTimeEntries([...timeEntries, entry]);
        setIsDialogOpen(false);
    };

    const handleDeleteTimeEntry = (entryId: string) => {
        const updatedTimeEntries = timeEntries.filter(
            (entry) => entry.id !== entryId
        );
        setTimeEntries(updatedTimeEntries);
    };
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleSelectSlot = (slotInfo: any) => {
        const { start, end } = slotInfo;
        setSelectedSlot({ start, end });
        setIsDialogOpen(true);
    };

    const [categories, setCategories] = useState<Category[]>([]);
    useEffect(() => {
        const savedCategories = localStorage.getItem("timeTrackerCategories");
        if (savedCategories) {
            setCategories(JSON.parse(savedCategories));
        }
    }, []);
    const getCategoryColor = (categoryName: string) => {
        const category = categories.find((cat) => cat.name === categoryName);
        return category ? category.color : "#000000"; // Default color if not found
    };

    return (
        <div className="container mx-auto px-4 flex flex-col h-dvh">
            <div className="sticky flex items-center top-0 w-full justify-between bg-muted px-3 rounded-b-xl shadow-lg z-50 py-1">
                <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1 mr-3">
                        <img
                            src="/icons/icon-192x192.png"
                            className="rounded-lg w-7 h-7"
                        />
                        <h1 className="text-xl font-bold">Tome Tracker</h1>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        {/* <DialogTrigger asChild>
                            <Button>
                                <PlusCircle
                                    size="24"
                                    className="cursor-pointer"
                                />
                            </Button>
                        </DialogTrigger> */}
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>New Entry</DialogTitle>
                                <div className="flex flex-col gap-2">
                                    <TimeTracker
                                        selectedDate={selectedDate}
                                        onAddTimeEntry={handleAddTimeEntry}
                                        onClose={() => setIsDialogOpen(false)}
                                        selectedSlot={selectedSlot}
                                    />
                                </div>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="flex items-center justify-normal w-36 h-full"
                        >
                            <span>
                                {isToday
                                    ? "Today"
                                    : selectedDate.toLocaleDateString()}
                            </span>
                            <ChevronDown className="ml-auto" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-1">
                        <DayPicker
                            selected={selectedDate}
                            onSelect={handleDateChange}
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="flex gap-4 relative justify-between h-full overflow-hidden py-3">
                <div className="w-1/2 overflow-auto h-full relative space-y-9">
                    <div className="">
                        <DailyBreakdown
                            selectedDate={selectedDate}
                            timeEntries={timeEntries}
                        />
                    </div>
                    <div className="rounded-xl overflow-hidden">
                        <TimeEntryList
                            selectedDate={selectedDate}
                            timeEntries={timeEntries}
                            onDeleteTimeEntry={handleDeleteTimeEntry}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
                <div className="w-full h-full overflow-hidden bg-muted rounded-xl py-3">
                    <WeekView
                        getCategoryColor={getCategoryColor}
                        timeEntries={timeEntries}
                        onSelectSlot={handleSelectSlot}
                        selectedDate={selectedDate}
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
