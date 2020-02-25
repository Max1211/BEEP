<?php

namespace App\Http\Controllers\Api;

use App\Category;
use App\Hive;
use App\BeeRace;
use App\Inspection;
use App\InspectionItem;
use App\Image;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Moment\Moment;
use Auth;
use LaravelLocalization;

/**
 * @group Api\InspectionsController
 */
class InspectionsController extends Controller
{
    
    public function lists(Request $request)
    {
        $out               = [];
        $checklists        = $request->user()->allChecklists();
        $out['checklists'] = $checklists->orderBy('name')->get();
        
        $checklist    = null;

        if ($checklists->where('id',intval($request->input('id')))->count() > 0)
            $checklist = $checklists->where('id',intval($request->input('id')))->first();
        else
            $checklist = $request->user()->allChecklists()->orderBy('created_at', 'desc')->first();
    
        if ($checklist && $checklist->categories()->count() > 0)
            $checklist->categories = $checklist->categories()->get()->toTree();

        $out['checklist']  = $checklist;

        return response()->json($out);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function hive(Request $request, $hive_id)
    {
        $hive   = $request->user()->allHives()->findOrFail($hive_id);
        $locale = $request->filled('locale') ? $request->input('locale') : LaravelLocalization::getCurrentLocale();

        $inspections   = $hive->inspections_by_date();
        $items_by_date = $hive->inspection_items_by_date($locale);

        return response()->json(['inspections'=>$inspections, 'items_by_date'=>$items_by_date]);
    }

    public function show(Request $request, $id)
    {
        $inspection = $request->user()->allInspections()->find($id);
        if (isset($inspection) == false)
            return response()->json(null, 404);

        $inspection_items  = InspectionItem::where('inspection_id',$inspection->id)->groupBy('category_id')->get();
        $inspection->items = $inspection_items;
        return response()->json($inspection);
    }


    public function store(Request $request)
    {
        if ($request->filled('date') && $request->filled('items'))
        {
            $moment       = new Moment($request->input('date'));
            $date         = $moment->format('Y-m-d H:i:s');
            
            $data         = $request->except(['hive_id','items','date']);
            $user         = Auth::user();
            $hive         = $user->allHives(true)->find($request->input('hive_id'));
            $location     = $user->allLocations(true)->find($request->input('location_id'));

            $data['created_at']   = $date;
            $data['checklist_id'] = $request->filled('checklist_id') ? $request->input('checklist_id') : null;

            if ($request->filled('reminder_date'))
            {
                $reminder_moment = new Moment($request->input('reminder_date'));
                $data['reminder_date'] = $reminder_moment->format('Y-m-d H:i:s');
            }

            // select inspection if exists
            $inspection = null;
            if ($hive)
                $inspection = $hive->inspections()->orderBy('created_at','desc')->where('created_at', $date)->first();
            else if ($location)
                $inspection = $location->inspections()->orderBy('created_at','desc')->where('created_at', $date)->first();
            else
                $inspection = $user->inspections()->orderBy('created_at','desc')->where('created_at', $date)->first();

            // filter -1 values for impression and attention
            $data['impression']   = $request->filled('impression') && $request->input('impression') > -1 ? $request->input('impression') : null;
            $data['attention']    = $request->filled('attention')  && $request->input('attention')  > -1 ? $request->input('attention')  : null;

            //die(print_r(['data'=>$data,'inspection'=>$inspection,'user'=>$user->inspections()->get()->toArray()]));


            if (isset($inspection))
                $inspection->update($data);
            else
                $inspection = Inspection::create($data);
            
            // link inspection
            $inspection->users()->syncWithoutDetaching($user->id);

            if (isset($location))
                $inspection->locations()->syncWithoutDetaching($location->id);

            if (isset($hive))
                $inspection->hives()->syncWithoutDetaching($hive->id);


            // Set inspection items
            //die(print_r($request->input('items')));
            // clear to remove items not in input
            $inspection->items()->forceDelete();
            // add items in input
            foreach ($request->input('items') as $cat_id => $value) 
            {
                $category = Category::find($cat_id);
                if (isset($category) && isset($value))
                {
                    $itemData = 
                    [
                        'category_id'   => $category->id,
                        'inspection_id' => $inspection->id,
                        'value'         => $value,
                    ];
                    InspectionItem::create($itemData);

                    // add inspection link to Image
                    if ($category->inputTypeType() == 'image')
                    {
                        $image = Image::where('thumb_url', $value)->first();
                        if ($image)
                        {
                            $image->inspection_id = $inspection->id;
                            $image->save();
                        }
                    }
                }
            }
        }
        if (isset($inspection))
            return response()->json($inspection->id, 201);

    }


    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Location  $location
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        Auth::user()->inspections()->findOrFail($id)->delete();
    }

}
