import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Megaphone } from 'lucide-react';
import Card from '../components/common/Card';

/**
 * Communication — API ga ulangan Requests (complaints) va Announcements sahifalariga yo'naltirish.
 * Eski local mock state o'rniga real endpointlar ishlatiladi.
 */
const Communication: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Aloqa</h2>
        <p className="text-sm text-gray-600">Shikoyatlar va e&apos;lonlar (API)</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/requests">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <div className="flex items-start gap-3 p-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">So&apos;rovlar / Shikoyatlar</h3>
                <p className="text-sm text-gray-600 mt-1">
                  GET/PATCH /api/complaints/ — talaba murojaatlari
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/announcements">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <div className="flex items-start gap-3 p-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <Megaphone className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">E&apos;lonlar</h3>
                <p className="text-sm text-gray-600 mt-1">
                  /notifications/ va /tasks-for-leaders/
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default Communication;
